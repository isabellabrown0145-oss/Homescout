import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Stars,
  Sparkles,
  MeshDistortMaterial,
} from '@react-three/drei';
import type { Group, Mesh } from 'three';

function FloatingOrb({
  position,
  scale,
  color,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    mesh.current.rotation.x += delta * speed;
    mesh.current.rotation.y += delta * speed * 0.7;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.2}>
      <mesh ref={mesh} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.8}
          distort={0.35}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function EnergyRing({
  position,
  color,
  size,
  speed,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}) {
  const ring = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!ring.current) return;

    ring.current.rotation.x += delta * speed;
    ring.current.rotation.y += delta * speed * 0.6;
  });

  return (
    <mesh ref={ring} position={position}>
      <torusGeometry args={[size, 0.018, 12, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        metalness={1}
        roughness={0.2}
      />
    </mesh>
  );
}

function CityStructure({
  position,
  height,
  width,
}: {
  position: [number, number, number];
  height: number;
  width: number;
}) {
  const building = useRef<Group>(null);

  useFrame((state) => {
    if (!building.current) return;

    building.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.08;
  });

  return (
    <group ref={building} position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial
          color="#101b42"
          metalness={0.85}
          roughness={0.25}
          emissive="#123c91"
          emissiveIntensity={0.35}
        />
      </mesh>

      {Array.from({ length: 4 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            0,
            0.5 + i * (height / 5),
            width / 2 + 0.006,
          ]}
        >
          <boxGeometry args={[width * 0.55, 0.035, 0.015]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const world = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!world.current) return;

    world.current.rotation.y += delta * 0.025;
    world.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
  });

  return (
    <>
      <ambientLight intensity={0.8} />

      <pointLight
        position={[5, 5, 5]}
        intensity={45}
        color="#246bff"
      />

      <pointLight
        position={[-5, 2, -4]}
        intensity={35}
        color="#a020f0"
      />

      <pointLight
        position={[0, -3, 5]}
        intensity={25}
        color="#00d9ff"
      />

      <Stars
        radius={90}
        depth={55}
        count={1800}
        factor={4}
        saturation={0.8}
        fade
        speed={0.5}
      />

      <Sparkles
        count={100}
        scale={18}
        size={3}
        speed={0.35}
        opacity={0.7}
        color="#56cfff"
      />

      <group ref={world}>
        <FloatingOrb
          position={[-4, 1.5, -3]}
          scale={1.1}
          color="#174dff"
          speed={0.2}
        />

        <FloatingOrb
          position={[4, -1, -4]}
          scale={0.8}
          color="#a020f0"
          speed={0.3}
        />

        <FloatingOrb
          position={[0, 3, -6]}
          scale={0.6}
          color="#00d9ff"
          speed={0.25}
        />

        <EnergyRing
          position={[-3, 0, -5]}
          color="#087cff"
          size={1.7}
          speed={0.12}
        />

        <EnergyRing
          position={[3, 1, -6]}
          color="#a020f0"
          size={2}
          speed={-0.15}
        />

        <EnergyRing
          position={[0, -2, -7]}
          color="#00d9ff"
          size={2.8}
          speed={0.08}
        />

        <CityStructure
          position={[-5, -3, -5]}
          height={3}
          width={0.8}
        />

        <CityStructure
          position={[-3.8, -3, -6]}
          height={5}
          width={1}
        />

        <CityStructure
          position={[4, -3, -7]}
          height={4}
          width={0.9}
        />

        <CityStructure
          position={[5.2, -3, -6]}
          height={6}
          width={1}
        />
      </group>
    </>
  );
}

export default function CinematicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        background:
          'radial-gradient(ellipse at 20% 20%, #102d70 0%, transparent 45%), radial-gradient(ellipse at 80% 70%, #35105e 0%, transparent 45%), linear-gradient(135deg, #030817, #07132e 55%, #09051c)',
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 55,
        }}
        dpr={[1, 1.25]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

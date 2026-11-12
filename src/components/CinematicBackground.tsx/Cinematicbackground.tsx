import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Skyscraper({
  position,
  width,
  height,
  depth,
  color,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  color: string;
}) {
  const building = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (building.current) {
      building.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 0.6 + position[0]) * 0.035;
    }
  });

  const floors = Math.floor(height / 0.38);
  const windows = Math.max(2, Math.floor(width / 0.3));

  return (
    <group ref={building} position={position}>
      {/* Main building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.75}
          roughness={0.22}
        />
      </mesh>

      {/* Glowing vertical edges */}
      {[-width / 2, width / 2].map((x, i) => (
        <mesh key={i} position={[x, 0, depth / 2 + 0.015]}>
          <boxGeometry args={[0.035, height, 0.025]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      ))}

      {/* Windows */}
      {Array.from({ length: floors }).map((_, row) =>
        Array.from({ length: windows }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[
              -width / 2 + ((col + 0.5) * width) / windows,
              -height / 2 + row * 0.38 + 0.2,
              depth / 2 + 0.018,
            ]}
          >
            <boxGeometry args={[0.13, 0.19, 0.025]} />
            <meshStandardMaterial
              color="#061a36"
              emissive={row % 3 === 0 ? '#00bfff' : '#2464ff'}
              emissiveIntensity={1.8}
              metalness={0.7}
            />
          </mesh>
        ))
      )}

      {/* Rooftop */}
      <mesh position={[0, height / 2 + 0.08, 0]}>
        <boxGeometry args={[width * 0.75, 0.16, depth * 0.8]} />
        <meshStandardMaterial
          color="#142b55"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Rooftop antenna */}
      <mesh position={[0, height / 2 + 0.42, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.55, 8]} />
        <meshBasicMaterial color="#00eaff" />
      </mesh>

      <pointLight
        position={[0, height / 2 + 0.5, 0]}
        color="#008cff"
        intensity={1.5}
        distance={3}
      />
    </group>
  );
}

function LuxuryHouse({
  position,
}: {
  position: [number, number, number];
}) {
  const house = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (house.current) {
      house.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.3) * 0.025;
    }
  });

  return (
    <group ref={house} position={position} scale={1.15}>
      {/* Main house */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.8, 1.25, 1.8]} />
        <meshStandardMaterial
          color="#142b4b"
          metalness={0.65}
          roughness={0.25}
        />
      </mesh>

      {/* Flat roof */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3.1, 0.15, 2.05]} />
        <meshStandardMaterial
          color="#07162e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Roof lighting */}
      <mesh position={[0, 1.29, 0.95]}>
        <boxGeometry args={[2.9, 0.035, 0.035]} />
        <meshBasicMaterial color="#00eaff" />
      </mesh>

      {/* Glass windows */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.52, 0.915]}>
          <boxGeometry args={[0.55, 0.8, 0.035]} />
          <meshStandardMaterial
            color="#061c36"
            emissive="#007bff"
            emissiveIntensity={2}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Balcony */}
      <mesh position={[0, 0.05, 1.05]}>
        <boxGeometry args={[2.9, 0.08, 0.55]} />
        <meshStandardMaterial color="#607d9e" metalness={0.8} />
      </mesh>

      {/* Balcony rail */}
      <mesh position={[0, 0.25, 1.28]}>
        <boxGeometry args={[2.9, 0.035, 0.035]} />
        <meshBasicMaterial color="#00cfff" />
      </mesh>

      {/* Support columns */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x, -0.55, 0.75]}>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
          <meshStandardMaterial color="#243e60" metalness={0.8} />
        </mesh>
      ))}

      {/* Glowing entrance */}
      <mesh position={[0, -0.45, 0.93]}>
        <boxGeometry args={[0.38, 0.65, 0.04]} />
        <meshStandardMaterial
          color="#071b36"
          emissive="#006aff"
          emissiveIntensity={1.2}
        />
      </mesh>

      <pointLight
        position={[0, 1, 1.8]}
        color="#00bfff"
        intensity={3}
        distance={5}
      />
    </group>
  );
}

function NeonRing({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ring.current) {
      ring.current.rotation.x = clock.elapsedTime * 0.12;
      ring.current.rotation.y = clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={ring} position={position} scale={scale}>
      <torusGeometry args={[1, 0.018, 12, 100]} />
      <meshBasicMaterial
        color="#00d9ff"
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function City() {
  const world = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (world.current) {
      world.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.12) * 0.035 +
        pointer.x * 0.035;

      world.current.rotation.x = -pointer.y * 0.018;
    }
  });

  return (
    <group ref={world}>
      {/* Left skyline */}
      <Skyscraper
        position={[-7, -1.7, -5]}
        width={1.5}
        height={6.5}
        depth={1}
        color="#10264b"
      />

      <Skyscraper
        position={[-5.4, -2, -4]}
        width={1.5}
        height={4.5}
        depth={1}
        color="#152c55"
      />

      <Skyscraper
        position={[-3.9, -2, -6]}
        width={1.5}
        height={7}
        depth={1}
        color="#10294d"
      />

      <Skyscraper
        position={[-8.5, -2, -7]}
        width={1.3}
        height={3.8}
        depth={1}
        color="#142344"
      />

      {/* Right skyline */}
      <Skyscraper
        position={[7, -1.7, -5]}
        width={1.5}
        height={6.5}
        depth={1}
        color="#14284e"
      />

      <Skyscraper
        position={[5.4, -2, -4]}
        width={1.5}
        height={4.5}
        depth={1}
        color="#172e59"
      />

      <Skyscraper
        position={[3.9, -2, -6]}
        width={1.5}
        height={7}
        depth={1}
        color="#10294d"
      />

      <Skyscraper
        position={[8.5, -2, -7]}
        width={1.3}
        height={3.8}
        depth={1}
        color="#142344"
      />

      {/* Modern luxury houses */}
      <LuxuryHouse position={[-3.1, -3.5, -1.5]} />
      <LuxuryHouse position={[3.2, -3.5, -1.5]} />

      {/* Neon architectural rings */}
      <NeonRing position={[-5, 2, -3]} scale={1.5} />
      <NeonRing position={[5, 2, -3]} scale={1.3} />

      {/* Ground platform */}
      <mesh
        position={[0, -4.35, -2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[35, 25, 35, 35]} />
        <meshStandardMaterial
          color="#06142d"
          emissive="#031c48"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.3}
          wireframe
        />
      </mesh>
    </group>
  );
}

function MovingLights() {
  const lights = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (lights.current) {
      lights.current.rotation.y = clock.elapsedTime * 0.035;
      lights.current.position.y =
        Math.sin(clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group ref={lights}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh position={[-4, 2.5, -1]}>
          <icosahedronGeometry args={[0.45, 1]} />
          <meshStandardMaterial
            color="#006eff"
            emissive="#006eff"
            emissiveIntensity={2}
            metalness={0.8}
            roughness={0.15}
          />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh position={[4, 2.7, -2]}>
          <icosahedronGeometry args={[0.35, 1]} />
          <meshStandardMaterial
            color="#a000ff"
            emissive="#8500ff"
            emissiveIntensity={2}
            metalness={0.8}
          />
        </mesh>
      </Float>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.1} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2}
        color="#8cbaff"
      />

      <pointLight
        position={[-5, 3, 4]}
        intensity={4}
        color="#006eff"
        distance={15}
      />

      <pointLight
        position={[5, 2, 3]}
        intensity={4}
        color="#8a00ff"
        distance={15}
      />

      <Stars
        radius={100}
        depth={50}
        count={450}
        factor={4}
        fade
        speed={1}
      />

      <Sparkles
        count={90}
        scale={[20, 12, 10]}
        size={3}
        speed={0.5}
        color="#00cfff"
      />

      <City />
      <MovingLights />
    </>
  );
}

export default function CinematicBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 0,
        background:
          'radial-gradient(ellipse at 50% 35%, #142b59 0%, #080e25 48%, #020611 100%)',
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 48,
        }}
        dpr={[1, 1.25]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene />
      </Canvas>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 50%, rgba(2,6,17,0.55) 100%)',
        }}
      />
    </div>
  );
}

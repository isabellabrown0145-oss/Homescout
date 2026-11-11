import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Group } from 'three';

function HouseModel() {
  const houseRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!houseRef.current) return;

    houseRef.current.rotation.y += delta * 0.12;
    houseRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
  });

  return (
    <group ref={houseRef} position={[0, -0.45, 0]}>

      {/* Ground platform */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 2.8, 0.22, 64]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.8} />
      </mesh>

      {/* Main house */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 1.9, 2.1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Front roof */}
      <mesh
        position={[0, 2.05, 0]}
        rotation={[0, 0, 0]}
        castShadow
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -1.55, 0, -1.2,
                 1.55, 0, -1.2,
                 0, 1.25, -1.2,
                -1.55, 0, 1.2,
                 1.55, 0, 1.2,
                 0, 1.25, 1.2,
              ]),
              3,
            ]}
          />
          <bufferAttribute
            attach="index"
            args={[new Uint16Array([
              0, 1, 2,
              3, 5, 4,
              0, 3, 4, 0, 4, 1,
              1, 4, 5, 1, 5, 2,
              2, 5, 3, 2, 3, 0,
            ]), 1]}
          />
          <bufferAttribute
            attach="attributes-normal"
            args={[
              new Float32Array([
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <meshStandardMaterial
          color="#1e3a8a"
          roughness={0.65}
          side={2}
        />
      </mesh>

      {/* Front door */}
      <mesh position={[0, 0.48, 1.065]} castShadow>
        <boxGeometry args={[0.48, 0.95, 0.07]} />
        <meshStandardMaterial color="#92400e" roughness={0.5} />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.16, 0.48, 1.11]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.7} />
      </mesh>

      {/* Front windows */}
      {[-0.85, 0.85].map((x) => (
        <group key={x} position={[x, 1.05, 1.07]}>
          <mesh>
            <boxGeometry args={[0.62, 0.65, 0.06]} />
            <meshStandardMaterial
              color="#60a5fa"
              metalness={0.2}
              roughness={0.2}
              emissive="#1d4ed8"
              emissiveIntensity={0.12}
            />
          </mesh>

          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.045, 0.68, 0.035]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          <mesh position={[0, 0, 0.045]}>
            <boxGeometry args={[0.65, 0.045, 0.035]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Chimney */}
      <mesh position={[0.85, 2.35, -0.35]} castShadow>
        <boxGeometry args={[0.35, 0.9, 0.4]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Garden trees */}
      {[-2.1, 2.1].map((x) => (
        <group key={x} position={[x, 0, -0.2]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 0.9, 8]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>

          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshStandardMaterial color="#16a34a" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Front garden */}
      <mesh position={[0, -0.045, 1.55]}>
        <boxGeometry args={[1.4, 0.08, 0.45]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>

    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.5} />

      <directionalLight
        position={[5, 8, 6]}
        intensity={2.2}
      />

      <pointLight
        position={[-4, 3, -3]}
        intensity={1}
        color="#60a5fa"
      />

      <HouseModel />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export default function HouseScene() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);

    const update = () => setReducedMotion(media.matches);

    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div className="w-full h-[340px] sm:h-[440px] relative">
      <Canvas
        camera={{ position: [5, 3.5, 6], fov: 38 }}
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          {reducedMotion && null}
        </Suspense>
      </Canvas>
    </div>
  );
           }

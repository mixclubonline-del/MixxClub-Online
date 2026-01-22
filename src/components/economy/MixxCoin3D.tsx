import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface MixxCoin3DProps {
  type: 'earned' | 'purchased' | 'both';
  autoRotate?: boolean;
  className?: string;
}

// Coin mesh component
function CoinMesh({
  type,
  position = [0, 0, 0],
  autoRotate = true,
}: {
  type: 'earned' | 'purchased';
  position?: [number, number, number];
  autoRotate?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const colors = type === 'earned'
    ? { primary: '#8b5cf6', secondary: '#06b6d4', emissive: '#a855f7' }
    : { primary: '#f59e0b', secondary: '#fbbf24', emissive: '#d97706' };

  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh ref={meshRef} position={position}>
        {/* Main coin body */}
        <cylinderGeometry args={[1, 1, 0.15, 64]} />
        <MeshDistortMaterial
          color={colors.primary}
          emissive={colors.emissive}
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.1}
          distort={0.05}
          speed={2}
        />
      </mesh>

      {/* Inner ring detail */}
      <mesh position={[position[0], position[1] + 0.08, position[2]]}>
        <ringGeometry args={[0.5, 0.7, 64]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.secondary}
          emissiveIntensity={0.3}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center emblem glow */}
      <mesh position={[position[0], position[1] + 0.085, position[2]]}>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.secondary}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Edge glow ring */}
      <mesh position={[position[0], position[1], position[2]]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.02, 0.02, 16, 64]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.secondary}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

// Energy bridge between coins
function EnergyBridge() {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount;
    positions[i * 3] = (t - 0.5) * 3;
    positions[i * 3 + 1] = Math.sin(t * Math.PI) * 0.3;
    positions[i * 3 + 2] = 0;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a855f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Scene component
function CoinScene({
  type,
  autoRotate,
}: {
  type: 'earned' | 'purchased' | 'both';
  autoRotate: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      {type === 'both' ? (
        <>
          <CoinMesh type="earned" position={[-1.5, 0, 0]} autoRotate={autoRotate} />
          <CoinMesh type="purchased" position={[1.5, 0, 0]} autoRotate={autoRotate} />
          <EnergyBridge />
        </>
      ) : (
        <CoinMesh type={type} position={[0, 0, 0]} autoRotate={autoRotate} />
      )}

      <Environment preset="city" />
    </>
  );
}

export function MixxCoin3D({
  type,
  autoRotate = true,
  className,
}: MixxCoin3DProps) {
  return (
    <div className={cn('w-full h-full min-h-[200px]', className)}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 animate-pulse" />
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 2, 5], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <CoinScene type={type} autoRotate={autoRotate} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default MixxCoin3D;

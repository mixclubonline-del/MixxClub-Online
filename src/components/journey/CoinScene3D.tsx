import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import MixxCoin from '@/components/economy/MixxCoin';

/* ─── spinning coin plane ─── */
function CoinDisc({
  position,
  color,
  emissive,
}: {
  position: [number, number, number];
  color: string;
  emissive: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position}>
        <cylinderGeometry args={[0.8, 0.8, 0.08, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.6}
          metalness={0.85}
          roughness={0.18}
        />
      </mesh>
    </Float>
  );
}

/* ─── particle dust between coins ─── */
function ParticleDust({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return arr;
  });

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#c084fc"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── R3F scene ─── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[-2, 1, 2]} intensity={1.2} color="#a855f7" />
      <pointLight position={[2, 1, 2]} intensity={1.2} color="#fbbf24" />

      {/* Earned coin (left) */}
      <CoinDisc position={[-1.2, 0, 0]} color="#71717a" emissive="#7c3aed" />

      {/* Purchased coin (right) */}
      <CoinDisc position={[1.2, 0, 0]} color="#d4a017" emissive="#f59e0b" />

      <ParticleDust />
      <Environment preset="night" />
    </>
  );
}

/* ─── exported component with WebGL fallback ─── */
export default function CoinScene3D({ className = '' }: { className?: string }) {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    // Fallback: static 2D coins
    return (
      <div className={`flex items-center justify-center gap-6 ${className}`}>
        <MixxCoin type="earned" size="hero" animated showGlow />
        <MixxCoin type="purchased" size="hero" animated showGlow />
      </div>
    );
  }

  return (
    <div className={`w-full aspect-video ${className}`}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full gap-6">
            <MixxCoin type="earned" size="xl" animated showGlow />
            <MixxCoin type="purchased" size="xl" animated showGlow />
          </div>
        }
      >
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 2]}>
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}

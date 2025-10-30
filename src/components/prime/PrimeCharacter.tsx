import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { usePrime } from '@/contexts/PrimeContext';
import * as THREE from 'three';

interface PrimeOrbProps {
  size?: 'mini' | 'small' | 'medium' | 'large' | 'hero';
}

const PrimeOrb = ({ size = 'medium' }: PrimeOrbProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { glowIntensity, pulseRate, accentColor, audioState } = usePrime();

  const sizeMap = {
    mini: 0.3,
    small: 0.8,
    medium: 1.5,
    large: 2.5,
    hero: 4
  };

  const scale = sizeMap[size];
  const amplitude = audioState.amplitude / 100;

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation based on time
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.005;
      
      // Pulse with audio
      const pulse = 1 + (amplitude * 0.3);
      meshRef.current.scale.setScalar(scale * pulse);
    }
  });

  const color = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4 + amplitude * 0.3}
          speed={pulseRate / 1000}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={glowIntensity * 2}
        />
      </Sphere>
      
      {/* Outer glow sphere */}
      <Sphere args={[1.3, 32, 32]} scale={scale}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1 + amplitude * 0.2}
          side={THREE.BackSide}
        />
      </Sphere>
    </Float>
  );
};

const OrbitingParticles = ({ count = 20, radius = 3 }: { count?: number; radius?: number }) => {
  const { accentColor, audioState } = usePrime();
  const particlesRef = useRef<THREE.Group>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i / count) * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.2,
      offset: Math.random() * Math.PI * 2
    }));
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.005;
      
      particlesRef.current.children.forEach((child, i) => {
        const particle = particles[i];
        const time = state.clock.elapsedTime;
        const angle = particle.angle + time * particle.speed;
        const y = Math.sin(time * particle.speed + particle.offset) * 0.5;
        
        child.position.x = Math.cos(angle) * radius;
        child.position.z = Math.sin(angle) * radius;
        child.position.y = y;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle) => (
        <mesh key={particle.id}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial 
            color={accentColor} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

const HolographicRings = ({ count = 3 }: { count?: number }) => {
  const ringsRef = useRef<THREE.Group>(null);
  const { accentColor, pulseRate } = usePrime();

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      
      ringsRef.current.children.forEach((child, i) => {
        const scale = 1 + Math.sin(state.clock.elapsedTime * (pulseRate / 1000) + i) * 0.1;
        child.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2 + i * 0.5, 0.02, 16, 100]} />
          <meshBasicMaterial 
            color={accentColor} 
            transparent 
            opacity={0.3 - i * 0.08}
          />
        </mesh>
      ))}
    </group>
  );
};

export const PrimeCharacter = ({ 
  size = 'medium',
  showParticles = true,
  showRings = true,
  className = ''
}: {
  size?: 'mini' | 'small' | 'medium' | 'large' | 'hero';
  showParticles?: boolean;
  showRings?: boolean;
  className?: string;
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <PrimeOrb size={size} />
        {showRings && <HolographicRings count={3} />}
        {showParticles && <OrbitingParticles count={20} radius={size === 'hero' ? 5 : 3} />}
      </Canvas>
    </div>
  );
};

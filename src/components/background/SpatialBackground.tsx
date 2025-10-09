import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
}

function ParticleField({ count = 200 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Float32Array | null>(null);

  // Initialize particles
  if (!particlesRef.current) {
    const particles = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 20;
      particles[i * 3 + 1] = (Math.random() - 0.5) * 20;
      particles[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    particlesRef.current = particles;
  }

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Gentle rotation
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.05;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    
    // Floating effect
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesRef.current!}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8B5CF6"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GridPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Subtle wave motion
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <meshBasicMaterial
        color="#6366F1"
        wireframe
        transparent
        opacity={0.1}
      />
    </mesh>
  );
}

function FloatingOrbs() {
  const orb1Ref = useRef<THREE.Mesh>(null);
  const orb2Ref = useRef<THREE.Mesh>(null);
  const orb3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (orb1Ref.current) {
      orb1Ref.current.position.x = Math.sin(t * 0.5) * 4;
      orb1Ref.current.position.y = Math.cos(t * 0.3) * 2;
      orb1Ref.current.position.z = Math.sin(t * 0.4) * 3;
    }
    
    if (orb2Ref.current) {
      orb2Ref.current.position.x = Math.cos(t * 0.4) * 5;
      orb2Ref.current.position.y = Math.sin(t * 0.5) * 2.5;
      orb2Ref.current.position.z = Math.cos(t * 0.3) * 4;
    }
    
    if (orb3Ref.current) {
      orb3Ref.current.position.x = Math.sin(t * 0.3) * 3.5;
      orb3Ref.current.position.y = Math.cos(t * 0.6) * 3;
      orb3Ref.current.position.z = Math.sin(t * 0.5) * 2.5;
    }
  });

  return (
    <group>
      <mesh ref={orb1Ref}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#6366F1"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={orb2Ref}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={orb3Ref}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

interface SpatialBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const SpatialBackground = ({ intensity = 'medium', className = '' }: SpatialBackgroundProps) => {
  const particleCount = intensity === 'low' ? 100 : intensity === 'medium' ? 200 : 400;

  return (
    <div 
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ 
        zIndex: 0,
        opacity: 0.4,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#6366F1" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8B5CF6" />
        
        <ParticleField count={particleCount} />
        <GridPlane />
        <FloatingOrbs />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a0f', 5, 25]} />
      </Canvas>
    </div>
  );
};

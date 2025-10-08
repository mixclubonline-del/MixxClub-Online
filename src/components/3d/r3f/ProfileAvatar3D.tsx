import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Sphere, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { HolographicMaterial } from '../materials/HolographicMaterial';
import { GlowMaterial } from '../materials/GlowMaterial';

const Avatar = ({ userName }: { userName: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  });

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <group ref={groupRef}>
      {/* Main avatar sphere */}
      <Sphere args={[1.5, 32, 32]}>
        <HolographicMaterial color="#8b5cf6" speed={0.5} />
      </Sphere>

      {/* Outer glow */}
      <Sphere args={[1.6, 32, 32]}>
        <GlowMaterial color="#8b5cf6" intensity={1.5} speed={1} />
      </Sphere>

      {/* Initials */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {initials}
      </Text>

      {/* Orbital rings */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.5, 0, i * 0.7]}>
          <torusGeometry args={[2 + i * 0.3, 0.02, 16, 100]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
};

interface ProfileAvatar3DProps {
  userName: string;
  className?: string;
}

export const ProfileAvatar3D = ({ userName, className = '' }: ProfileAvatar3DProps) => {
  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

        <Avatar userName={userName} />
      </Canvas>
    </div>
  );
};

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Cone } from '@react-three/drei';
import * as THREE from 'three';

interface VinylPlayer3DProps {
  isPlaying: boolean;
  color?: string;
}

export const VinylPlayer3D = ({ isPlaying, color = '#1a1a2e' }: VinylPlayer3DProps) => {
  const vinylRef = useRef<THREE.Mesh>(null);
  const needleRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!vinylRef.current || !needleRef.current) return;

    if (isPlaying) {
      vinylRef.current.rotation.z += 0.02;
      
      // Needle subtle movement
      const time = Date.now() / 1000;
      needleRef.current.rotation.z = Math.sin(time * 2) * 0.02;
    }
  });

  return (
    <group>
      {/* Vinyl Record */}
      <Cylinder ref={vinylRef} args={[2, 2, 0.05, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>

      {/* Center Label */}
      <Cylinder args={[0.5, 0.5, 0.06, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
        />
      </Cylinder>

      {/* Needle */}
      <group ref={needleRef} position={[1.5, 0, 0.5]}>
        <Cone args={[0.05, 0.8, 8]} rotation={[0, 0, -Math.PI / 4]}>
          <meshStandardMaterial
            color="#silver"
            metalness={0.9}
            roughness={0.1}
          />
        </Cone>
      </group>
    </group>
  );
};

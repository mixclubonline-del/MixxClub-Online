import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Product3DProps {
  color?: string;
  type: 'vinyl' | 'cassette' | 'plugin';
}

const Product3D = ({ color = '#8b5cf6', type }: Product3DProps) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {type === 'vinyl' && (
        <>
          {/* Vinyl Record */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.05, 64]} />
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Label */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.01, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      )}
      
      {type === 'cassette' && (
        <Box args={[1.5, 0.8, 0.3]}>
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.7}
          />
        </Box>
      )}
      
      {type === 'plugin' && (
        <Box args={[1.2, 1.2, 0.2]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.5}
          />
        </Box>
      )}
    </group>
  );
};

interface Product3DCardProps {
  color?: string;
  type: 'vinyl' | 'cassette' | 'plugin';
  className?: string;
}

export const Product3DCard = ({ color, type, className = '' }: Product3DCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={isHovered}
          autoRotateSpeed={4}
        />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 5, 5]} angle={0.3} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color={color} />

        <Product3D color={color} type={type} />
      </Canvas>
    </div>
  );
};

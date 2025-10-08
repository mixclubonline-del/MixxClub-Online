import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

const Bar3D = ({ 
  position, 
  height, 
  color, 
  label 
}: { 
  position: [number, number, number], 
  height: number, 
  color: string, 
  label: string 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetHeight = height * 5;

  useFrame(() => {
    if (!meshRef.current) return;
    const currentHeight = meshRef.current.scale.y;
    meshRef.current.scale.y = THREE.MathUtils.lerp(currentHeight, targetHeight, 0.1);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={[1, 0.1, 1]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      <Text
        position={[0, targetHeight + 0.5, 0]}
        fontSize={0.25}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(height * 100)}
      </Text>
    </group>
  );
};

interface Stats3DChartProps {
  data: DataPoint[];
  className?: string;
}

export const Stats3DChart = ({ data, className = '' }: Stats3DChartProps) => {
  return (
    <div className={className}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={8}
          maxDistance={15}
        />
        
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.3} 
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Bars */}
        {data.map((point, i) => {
          const x = (i - data.length / 2) * 2;
          return (
            <Bar3D
              key={point.label}
              position={[x, 0, 0]}
              height={point.value}
              color={point.color}
              label={point.label}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

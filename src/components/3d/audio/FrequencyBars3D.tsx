import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FrequencyBars3DProps {
  frequencyData: number[];
  color?: string;
  spacing?: number;
}

export const FrequencyBars3D = ({ 
  frequencyData, 
  color = '#8b5cf6',
  spacing = 0.3 
}: FrequencyBars3DProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const targetScale = Math.max(0.1, frequencyData[i] || 0);
        child.scale.y = THREE.MathUtils.lerp(child.scale.y, targetScale * 2, 0.2);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {frequencyData.map((_, i) => {
        const x = (i - frequencyData.length / 2) * spacing;
        return (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
};

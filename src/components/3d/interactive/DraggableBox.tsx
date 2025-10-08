import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

interface DraggableBoxProps {
  position?: [number, number, number];
  color?: string;
  onDrag?: (position: [number, number, number]) => void;
}

export const DraggableBox = ({ 
  position = [0, 0, 0], 
  color = '#8b5cf6',
  onDrag 
}: DraggableBoxProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Hover effect
    if (isHovered && !isDragging) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
    } else if (!isDragging) {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
    
    // Rotate when dragging
    if (isDragging) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && meshRef.current) {
      const newPos: [number, number, number] = [e.point.x, e.point.y, position[2]];
      meshRef.current.position.set(...newPos);
      onDrag?.(newPos);
    }
  };

  return (
    <Box
      ref={meshRef}
      position={position}
      args={[1, 1, 1]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      castShadow
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isHovered ? 0.5 : 0.2}
        metalness={0.6}
        roughness={0.4}
      />
    </Box>
  );
};

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface WaveformSphere3DProps {
  audioData: number[];
  color?: string;
  size?: number;
}

export const WaveformSphere3D = ({ 
  audioData, 
  color = '#8b5cf6',
  size = 2 
}: WaveformSphere3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);

  const vertices = useMemo(() => {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    return geometry.attributes.position.array;
  }, [size]);

  useFrame(() => {
    if (!meshRef.current || !geometryRef.current) return;

    const positions = geometryRef.current.attributes.position;
    const originalPositions = vertices;

    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      const audioIndex = Math.floor((i / positions.count) * audioData.length);
      const displacement = audioData[audioIndex] || 0;

      const x = originalPositions[i3];
      const y = originalPositions[i3 + 1];
      const z = originalPositions[i3 + 2];

      const length = Math.sqrt(x * x + y * y + z * z);
      const scale = 1 + displacement * 0.3;

      positions.setXYZ(
        i,
        (x / length) * length * scale,
        (y / length) * length * scale,
        (z / length) * length * scale
      );
    }

    positions.needsUpdate = true;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <Sphere ref={meshRef} args={[size, 32, 32]}>
      <sphereGeometry ref={geometryRef} args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        wireframe
        emissive={color}
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
};

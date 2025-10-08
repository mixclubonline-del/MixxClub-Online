import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface Fader {
  id: string;
  level: number;
  color: string;
  label: string;
}

const FaderChannel = ({ position, level, color }: { position: [number, number, number], level: number, color: string }) => {
  const faderRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!faderRef.current) return;
    const targetY = position[1] + (level * 2);
    faderRef.current.position.y = THREE.MathUtils.lerp(faderRef.current.position.y, targetY, 0.1);
  });

  return (
    <group position={position}>
      {/* Fader track */}
      <Box args={[0.1, 2.5, 0.05]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#2a2a3e" />
      </Box>
      
      {/* Fader handle */}
      <group ref={faderRef} position={[0, level * 2, 0]}>
        <Box args={[0.3, 0.2, 0.15]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </Box>
      </group>
      
      {/* Level meter */}
      <Box args={[0.15, 2, 0.05]} position={[0.5, 1, 0]}>
        <meshStandardMaterial
          color={level > 0.7 ? '#ff4444' : level > 0.5 ? '#ffaa00' : '#44ff44'}
          emissive={level > 0.7 ? '#ff4444' : level > 0.5 ? '#ffaa00' : '#44ff44'}
          emissiveIntensity={level}
        />
      </Box>

      {/* Knob */}
      <Cylinder args={[0.2, 0.2, 0.1, 16]} position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#4a4a6a" metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  );
};

const MixingConsole = ({ tracks }: { tracks: Fader[] }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Console base */}
      <Box args={[tracks.length * 1.2 + 1, 0.2, 3]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} />
      </Box>

      {/* Fader channels */}
      {tracks.map((track, i) => {
        const x = (i - tracks.length / 2) * 1.2;
        return (
          <FaderChannel
            key={track.id}
            position={[x, 0, 0]}
            level={track.level}
            color={track.color}
          />
        );
      })}
    </group>
  );
};

interface MixingConsole3DProps {
  tracks: Fader[];
  className?: string;
}

export const MixingConsole3D = ({ tracks, className = '' }: MixingConsole3DProps) => {
  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 3, 8]} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[0, 10, 5]} angle={0.5} intensity={1.5} color="#8b5cf6" />
        <pointLight position={[-5, 3, -3]} intensity={0.5} color="#6366f1" />
        <pointLight position={[5, 3, -3]} intensity={0.5} color="#ec4899" />

        <MixingConsole tracks={tracks} />
      </Canvas>
    </div>
  );
};

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const VSDisplay = () => {
  const textRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!textRef.current) return;
    textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    textRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
  });

  return (
    <group ref={textRef}>
      <Text
        position={[0, 0, 0]}
        fontSize={2}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        VS
      </Text>
    </group>
  );
};

const BattleStage = () => {
  return (
    <>
      {/* Stage Platform */}
      <Box args={[10, 0.2, 6]} position={[0, -1, 0]}>
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      {/* Lights */}
      <Sphere args={[0.3]} position={[-3, 2, -2]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={2}
        />
      </Sphere>
      
      <Sphere args={[0.3]} position={[3, 2, -2]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
        />
      </Sphere>
    </>
  );
};

interface BattleArenaSceneProps {
  className?: string;
}

export const BattleArenaScene = ({ className = '' }: BattleArenaSceneProps) => {
  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
        
        <ambientLight intensity={0.3} />
        <spotLight position={[0, 10, 0]} angle={0.5} intensity={2} color="#8b5cf6" />
        <pointLight position={[-5, 3, 0]} intensity={1} color="#ff00ff" />
        <pointLight position={[5, 3, 0]} intensity={1} color="#00ffff" />

        <VSDisplay />
        <BattleStage />
      </Canvas>
    </div>
  );
};

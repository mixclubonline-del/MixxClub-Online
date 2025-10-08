import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { DraggableBox } from '../interactive/DraggableBox';
import { Suspense } from 'react';

interface Interactive3DShowcaseProps {
  className?: string;
}

export const Interactive3DShowcase = ({ className = '' }: Interactive3DShowcaseProps) => {
  return (
    <div className={className}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 8]} />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
        
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.3} 
          intensity={1.5}
          castShadow
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        <Suspense fallback={null}>
          <DraggableBox position={[-2, 1, 0]} color="#8b5cf6" />
          <DraggableBox position={[0, 1, 0]} color="#06b6d4" />
          <DraggableBox position={[2, 1, 0]} color="#ec4899" />
        </Suspense>
      </Canvas>
    </div>
  );
};

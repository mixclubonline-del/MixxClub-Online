import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { VinylPlayer3D } from '../audio/VinylPlayer3D';
import { use3DQuality } from '@/hooks/use3DQuality';

interface VinylPlayerSceneProps {
  isPlaying: boolean;
  className?: string;
}

export const VinylPlayerScene = ({ isPlaying, className = '' }: VinylPlayerSceneProps) => {
  const { quality } = use3DQuality();

  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 3, 5]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} angle={0.3} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" />

        <VinylPlayer3D isPlaying={isPlaying} />

        {quality === 'high' && (
          <EffectComposer>
            <Bloom intensity={0.3} luminanceThreshold={0.5} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

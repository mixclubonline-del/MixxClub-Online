import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { WaveformSphere3D } from '../audio/WaveformSphere3D';
import { FrequencyBars3D } from '../audio/FrequencyBars3D';

interface AudioVisualizerSceneProps {
  audioData: number[];
  frequencyData: number[];
  className?: string;
}

export const AudioVisualizerScene = ({ 
  audioData, 
  frequencyData,
  className = '' 
}: AudioVisualizerSceneProps) => {
  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <OrbitControls enableZoom={false} enablePan={false} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        <WaveformSphere3D audioData={audioData} />
        <FrequencyBars3D frequencyData={frequencyData} />
      </Canvas>
    </div>
  );
};

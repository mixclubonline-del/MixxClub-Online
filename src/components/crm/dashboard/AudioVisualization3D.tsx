import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useAudioVisualization } from '@/hooks/useAudioVisualization';

function WaveformMesh({ audioData }: { audioData: number[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth rotation
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    meshRef.current.rotation.y += 0.003;

    // Audio reactivity
    const avgAmplitude = audioData.reduce((a, b) => a + b, 0) / audioData.length;
    meshRef.current.scale.y = 1 + avgAmplitude * 0.5;

    // Hover effect
    if (hovered) {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1.1, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1.1, 0.1);
    } else {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1, 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[2, 1, 2, 32, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? "#8B5CF6" : "#6366F1"}
        wireframe
        emissive={hovered ? "#8B5CF6" : "#000000"}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function WaveformBars({ audioData }: { audioData: number[] }) {
  return (
    <group>
      {audioData.map((amplitude, i) => (
        <mesh
          key={i}
          position={[
            (i - audioData.length / 2) * 0.15,
            amplitude * 2,
            0
          ]}
        >
          <boxGeometry args={[0.1, amplitude * 4, 0.1]} />
          <meshStandardMaterial
            color="#6366F1"
            emissive="#8B5CF6"
            emissiveIntensity={amplitude}
          />
        </mesh>
      ))}
    </group>
  );
}

export const AudioVisualization3D = () => {
  const { audioData, isPlaying, togglePlay } = useAudioVisualization();
  const [visualMode, setVisualMode] = useState<'waveform' | 'bars'>('waveform');

  return (
    <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          Audio Visualization
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setVisualMode(visualMode === 'waveform' ? 'bars' : 'waveform')}
          >
            {visualMode === 'waveform' ? 'Bars' : 'Wave'}
          </Button>
          <Button
            size="sm"
            onClick={togglePlay}
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-80 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
            
            {visualMode === 'waveform' ? (
              <WaveformMesh audioData={audioData} />
            ) : (
              <WaveformBars audioData={audioData} />
            )}
            
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={3}
              maxDistance={10}
            />
          </Canvas>
        </div>
        
        {/* Info Bar */}
        <div className="p-4 bg-muted/50 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Interactive 3D Audio Waveform</span>
          <span className="text-xs text-muted-foreground">
            Drag to rotate • Scroll to zoom
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WaveformVisualizerProps {
  audioUrl: string;
  height?: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

export function WaveformVisualizer({ 
  audioUrl, 
  height = 80, 
  currentTime = 0,
  onSeek 
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudioData();
  }, [audioUrl]);

  useEffect(() => {
    if (waveformData.length > 0) {
      drawWaveform();
    }
  }, [waveformData, currentTime]);

  const loadAudioData = async () => {
    try {
      setIsLoading(true);
      const audioContext = new AudioContext();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      setDuration(audioBuffer.duration);

      // Extract waveform data
      const rawData = audioBuffer.getChannelData(0);
      const samples = 1000; // Number of samples to display
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      setWaveformData(filteredData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio data:', error);
      setIsLoading(false);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Color based on playback position
      const isPast = index < waveformData.length * progress;
      ctx.fillStyle = isPast 
        ? 'hsl(var(--primary))' 
        : 'hsl(var(--muted-foreground) / 0.3)';
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw playhead
    const playheadX = width * progress;
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    onSeek(time);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div ref={containerRef} className="relative w-full">
          {isLoading ? (
            <div 
              className="flex items-center justify-center bg-muted/50 rounded"
              style={{ height }}
            >
              <span className="text-sm text-muted-foreground">Loading waveform...</span>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full cursor-pointer rounded hover:opacity-80 transition-opacity"
              onClick={handleClick}
              style={{ height }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useRef } from 'react';
import { WaveformData } from '@/services/waveformGenerator';

interface WaveformCanvasProps {
  waveformData: WaveformData;
  width: number;
  height: number;
  progress?: number;
  className?: string;
}

export const WaveformCanvas = ({
  waveformData,
  width,
  height,
  progress = 0,
  className = '',
}: WaveformCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    const barWidth = width / waveformData.peaks.length;
    const centerY = height / 2;
    const maxAmplitude = height / 2 - 4; // Leave 4px padding

    // Draw played portion (accent color)
    const playedBars = Math.floor(waveformData.peaks.length * progress);
    ctx.fillStyle = 'hsl(var(--accent))';
    for (let i = 0; i < playedBars; i++) {
      const peak = waveformData.peaks[i];
      const barHeight = peak * maxAmplitude;
      const x = i * barWidth;
      
      ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth - 1), barHeight * 2);
    }

    // Draw unplayed portion (muted foreground)
    ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
    for (let i = playedBars; i < waveformData.peaks.length; i++) {
      const peak = waveformData.peaks[i];
      const barHeight = peak * maxAmplitude;
      const x = i * barWidth;
      
      ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth - 1), barHeight * 2);
    }

    // Draw center line
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  }, [waveformData, width, height, progress]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className={className}
    />
  );
};

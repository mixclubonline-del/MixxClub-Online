import { useEffect, useRef } from 'react';

interface AudioWaveformRendererProps {
  waveformData: Float32Array | number[];
  width: number;
  height: number;
  color: string;
  progress?: number; // 0-1 for playback cursor
  zoom?: number; // Samples per pixel
  startOffset?: number; // For region trimming
}

/**
 * Professional Canvas-based Waveform Renderer
 * Renders real audio waveform data with playback progress
 */
export const AudioWaveformRenderer = ({
  waveformData,
  width,
  height,
  color,
  progress = 0,
  zoom = 1,
  startOffset = 0
}: AudioWaveformRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || waveformData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // High DPI rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const centerY = height / 2;
    const maxAmplitude = height / 2 - 4;
    
    // Smart sampling based on zoom
    const samplesPerPixel = Math.max(1, Math.ceil(waveformData.length / width / zoom));
    const startSample = Math.floor(startOffset * samplesPerPixel);
    
    // Calculate bar width based on samples per pixel
    const barWidth = Math.max(1, width / (waveformData.length / samplesPerPixel));
    
    for (let x = 0; x < width; x++) {
      const sampleIndex = startSample + Math.floor(x * samplesPerPixel);
      if (sampleIndex >= waveformData.length) break;
      
      // Peak detection across sample window
      let peakValue = 0;
      for (let j = 0; j < samplesPerPixel; j++) {
        const idx = sampleIndex + j;
        if (idx < waveformData.length) {
          peakValue = Math.max(peakValue, Math.abs(waveformData[idx]));
        }
      }
      
      const barHeight = peakValue * maxAmplitude;
      const xPos = x * barWidth;
      
      // Opacity for played vs unplayed
      const isPlayed = x / width < progress;
      ctx.globalAlpha = isPlayed ? 1 : 0.6;
      ctx.fillStyle = color;
      
      // Draw symmetric bar
      ctx.fillRect(
        xPos,
        centerY - barHeight,
        Math.max(1, barWidth - 1),
        barHeight * 2
      );
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;
    
    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
  }, [waveformData, width, height, color, progress, zoom, startOffset]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="absolute inset-0 pointer-events-none"
    />
  );
};

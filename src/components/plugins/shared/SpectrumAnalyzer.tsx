import React, { useRef, useEffect } from 'react';

interface SpectrumAnalyzerProps {
  analyser?: AnalyserNode;
  width?: number;
  height?: number;
  showGrid?: boolean;
  color?: string;
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  analyser,
  width = 400,
  height = 150,
  showGrid = true,
  color = 'hsl(var(--primary))',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
          const y = (height / 4) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Vertical lines (frequency markers)
        const freqMarkers = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
        freqMarkers.forEach(freq => {
          const x = Math.log10(freq / 20) / Math.log10(20000 / 20) * width;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        });
      }

      // Draw spectrum
      const barWidth = width / bufferLength;
      let x = 0;

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, color.replace(')', ', 0.3)').replace('hsl', 'hsla'));
      gradient.addColorStop(0.5, color.replace(')', ', 0.6)').replace('hsl', 'hsla'));
      gradient.addColorStop(1, color);

      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      // Draw glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const x = (i / bufferLength) * width;
        const y = height - barHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, width, height, showGrid, color]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/40">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
      {/* Frequency labels */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[9px] text-muted-foreground font-mono">
        <span>20Hz</span>
        <span>100Hz</span>
        <span>1kHz</span>
        <span>10kHz</span>
        <span>20kHz</span>
      </div>
    </div>
  );
};

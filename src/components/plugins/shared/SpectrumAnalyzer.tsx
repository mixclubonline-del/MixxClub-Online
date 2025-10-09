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

      // Draw spectrum with Mixxclub gradient
      const barWidth = width / bufferLength;
      let x = 0;

      // Mixxclub gradient: Pink -> Lavender -> Cyan
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(255,112,208,0.8)'); // Pink
      gradient.addColorStop(0.5, 'rgba(197,163,255,0.8)'); // Lavender
      gradient.addColorStop(1, 'rgba(112,230,255,0.8)'); // Cyan

      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      // Draw glow effect with Mixxclub gradient
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(197,163,255,0.6)';
      
      const glowGradient = ctx.createLinearGradient(0, 0, width, 0);
      glowGradient.addColorStop(0, '#FF70D0'); // Pink
      glowGradient.addColorStop(0.5, '#C5A3FF'); // Lavender
      glowGradient.addColorStop(1, '#70E6FF'); // Cyan
      
      ctx.strokeStyle = glowGradient;
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
    <div className="relative rounded-lg overflow-hidden border border-mixx-lavender/20 bg-mixx-navy-deep/60 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
      {/* Frequency labels */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[9px] text-mixx-cyan font-mono uppercase tracking-wider">
        <span>20Hz</span>
        <span>100Hz</span>
        <span>1kHz</span>
        <span>10kHz</span>
        <span>20kHz</span>
      </div>
    </div>
  );
};

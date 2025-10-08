import { useEffect, useRef } from 'react';

interface StudioWaveformStripProps {
  isPlaying: boolean;
}

export const StudioWaveformStrip = ({ isPlaying }: StudioWaveformStripProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let animationFrame: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'hsl(180, 80%, 50%)');
      gradient.addColorStop(0.5, 'hsl(280, 80%, 50%)');
      gradient.addColorStop(1, 'hsl(320, 80%, 50%)');

      ctx.fillStyle = gradient;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;

      ctx.beginPath();
      const centerY = height / 2;
      
      for (let x = 0; x < width; x += 2) {
        const time = (x + offset) / 50;
        const amplitude = isPlaying ? 15 : 5;
        const y = centerY + Math.sin(time) * amplitude * Math.sin(x / 100);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      if (isPlaying) {
        offset += 2;
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  return (
    <div className="absolute top-20 left-0 right-0 h-24 z-10">
      <canvas
        ref={canvasRef}
        width={1920}
        height={96}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
};

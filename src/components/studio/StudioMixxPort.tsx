import { useEffect, useRef } from 'react';

interface StudioMixxPortProps {
  isPlaying: boolean;
}

export const StudioMixxPort = ({ isPlaying }: StudioMixxPortProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;
      const maxHeight = canvas.height - 20;

      for (let i = 0; i < barCount; i++) {
        const frequency = i / barCount;
        const time = Date.now() / 1000;
        const amplitude = isPlaying 
          ? Math.abs(Math.sin(time * 2 + frequency * 10)) * 0.7 + 0.3
          : 0.1;
        
        const barHeight = amplitude * maxHeight;
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        const hue = 180 + frequency * 140;
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-44 w-96 h-[calc(100vh-300px)] bg-background/40 backdrop-blur-md rounded-lg border border-border/50 p-6">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium mb-4">Frequency Analyzer</h3>
        
        <div className="flex-1 mb-4">
          <canvas
            ref={canvasRef}
            width={340}
            height={400}
            className="w-full h-full rounded-lg bg-background/60"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Width</span>
            <span>100%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Delay</span>
            <span>0ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

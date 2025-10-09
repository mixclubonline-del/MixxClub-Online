import { useEffect, useRef, useState } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

export const DAWTimelineRuler = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const bpm = useAIStudioStore((state) => state.bpm);
  const [pixelsPerSecond] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, width, height);

    // Calculate time markers
    const beatsPerSecond = bpm / 60;
    const pixelsPerBeat = pixelsPerSecond / beatsPerSecond;
    const secondsVisible = width / pixelsPerSecond;

    // Draw time markers
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    // Draw beats
    for (let beat = 0; beat < secondsVisible * beatsPerSecond; beat++) {
      const x = beat * pixelsPerBeat;
      const isMeasure = beat % 4 === 0;
      
      ctx.lineWidth = isMeasure ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, height - (isMeasure ? 15 : 10));
      ctx.lineTo(x, height);
      ctx.stroke();

      // Draw measure numbers
      if (isMeasure) {
        const measure = Math.floor(beat / 4) + 1;
        ctx.fillText(`${measure}`, x + 2, height - 18);
      }
    }

    // Draw seconds
    ctx.strokeStyle = 'hsl(var(--primary) / 0.5)';
    for (let second = 0; second < secondsVisible; second++) {
      const x = second * pixelsPerSecond;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 10);
      ctx.stroke();
      
      if (second % 5 === 0) {
        ctx.fillText(`${second}s`, x + 2, 8);
      }
    }

    // Draw playhead position
    const playheadX = currentTime * pixelsPerSecond;
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

  }, [currentTime, bpm, pixelsPerSecond]);

  return (
    <div
      ref={containerRef}
      className="h-12 bg-gradient-to-r from-[hsl(230,35%,10%)] via-[hsl(230,30%,12%)] to-[hsl(230,35%,10%)] border-b border-[hsl(var(--primary)/0.2)] relative overflow-hidden shadow-lg"
    >
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.3)] to-transparent" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

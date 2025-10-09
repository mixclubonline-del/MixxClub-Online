import { useEffect, useRef } from 'react';

interface MusicalRulerProps {
  duration: number;
  tempo: number;
  pixelsPerSecond: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
}

/**
 * Musical timeline ruler showing bars, beats, and sub-divisions
 */
export const MusicalRuler = ({
  duration,
  tempo,
  pixelsPerSecond,
  currentTime,
  onTimeChange,
}: MusicalRulerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate musical units
  const secondsPerBeat = 60 / tempo;
  const secondsPerBar = secondsPerBeat * 4; // 4/4 time signature
  const pixelsPerBeat = secondsPerBeat * pixelsPerSecond;
  const pixelsPerBar = secondsPerBar * pixelsPerSecond;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = 'hsl(220, 18%, 18%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw prominent ZERO marker
    ctx.fillStyle = 'hsl(180, 100%, 50%)';
    ctx.fillRect(0, 0, 3, rect.height);
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('0', 6, 4);
    
    // Draw zero time label
    ctx.font = '10px monospace';
    ctx.fillStyle = 'hsl(180, 80%, 60%)';
    ctx.fillText('0:00.000', 6, 18);

    // Draw ruler markings
    const totalBars = Math.ceil(duration / secondsPerBar);
    
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let bar = 0; bar <= totalBars; bar++) {
      const barTime = bar * secondsPerBar;
      const barX = barTime * pixelsPerSecond;

      if (barX > rect.width) break;

      // Draw bar line (major)
      ctx.strokeStyle = 'hsl(220, 14%, 45%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barX, 20);
      ctx.lineTo(barX, rect.height);
      ctx.stroke();

      // Draw bar number and time
      ctx.fillStyle = 'hsl(220, 14%, 70%)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${bar + 1}`, barX + 4, 4);
      
      // Show bar:beat:tick format
      ctx.font = '9px monospace';
      ctx.fillStyle = 'hsl(220, 14%, 55%)';
      ctx.fillText(`${bar + 1}.1.000`, barX + 4, 16);

      // Draw beat subdivisions
      for (let beat = 1; beat < 4; beat++) {
        const beatTime = barTime + (beat * secondsPerBeat);
        const beatX = beatTime * pixelsPerSecond;

        if (beatX > rect.width) break;

        // Beat line (medium)
        ctx.strokeStyle = 'hsl(220, 14%, 35%)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beatX, 28);
        ctx.lineTo(beatX, rect.height);
        ctx.stroke();

        // Draw sub-divisions (sixteenth notes)
        for (let sub = 1; sub < 4; sub++) {
          const subTime = beatTime + (beat * secondsPerBeat) + (sub * secondsPerBeat / 4);
          const subX = subTime * pixelsPerSecond;

          if (subX > rect.width) break;

          // Sub-division line (minor)
          ctx.strokeStyle = 'hsl(220, 14%, 28%)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(subX, 32);
          ctx.lineTo(subX, rect.height);
          ctx.stroke();
        }
      }
    }

    // Draw playhead position indicator
    const playheadX = currentTime * pixelsPerSecond;
    if (playheadX >= 0 && playheadX <= rect.width) {
      ctx.fillStyle = 'hsl(var(--studio-accent))';
      ctx.fillRect(playheadX - 1, 0, 2, 16);
      
      // Draw time display at playhead
      const currentBar = Math.floor(currentTime / secondsPerBar) + 1;
      const beatInBar = Math.floor((currentTime % secondsPerBar) / secondsPerBeat) + 1;
      const subBeat = Math.floor(((currentTime % secondsPerBar) % secondsPerBeat) / (secondsPerBeat / 4)) + 1;
      
      const timeText = `${currentBar}.${beatInBar}.${subBeat}`;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'hsl(220, 18%, 12%)';
      const textWidth = ctx.measureText(timeText).width;
      ctx.fillRect(playheadX - textWidth / 2 - 4, 0, textWidth + 8, 16);
      ctx.fillStyle = 'hsl(var(--studio-accent))';
      ctx.fillText(timeText, playheadX, 3);
    }
  }, [duration, tempo, pixelsPerSecond, currentTime, secondsPerBar, secondsPerBeat]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    onTimeChange(Math.max(0, Math.min(duration, time)));
  };

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer select-none"
      onClick={handleClick}
      style={{
        height: 40,
        borderBottom: '1px solid hsl(220, 14%, 28%)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};

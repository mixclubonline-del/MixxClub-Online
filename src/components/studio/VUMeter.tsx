'use client';
import { useEffect, useRef } from 'react';

export interface VUMeterProps {
  peakDb?: number;           // dBFS (0 to ~-60)
  rmsDb?: number;            // dBFS (0 to ~-60)
  vertical?: boolean;
  width?: number;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const VUMeter: React.FC<VUMeterProps> = ({
  peakDb = -24,
  rmsDb = -28,
  vertical = true,
  width = 10,
  height = 64,
  showLabel = false,
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
    canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const map = (db: number) => Math.max(0, Math.min(1, 1 + db / 60)); // -60..0 dB -> 0..1
    const pk = map(peakDb);
    const rm = map(rmsDb);

    // bg
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, 'hsl(220,20%,14%)');
    bg.addColorStop(1, 'hsl(220,20%,10%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // RMS bar (cyan)
    ctx.fillStyle = 'hsl(180,100%,45%)';
    if (vertical) {
      ctx.fillRect(0, height * (1 - rm), width, height * rm);
    } else {
      ctx.fillRect(0, 0, width * rm, height);
    }

    // Peak line (purple)
    ctx.fillStyle = 'hsl(270,100%,70%)';
    if (vertical) {
      const y = height * (1 - pk);
      ctx.fillRect(0, y - 1, width, 2);
    } else {
      const x = width * pk;
      ctx.fillRect(x - 1, 0, 2, height);
    }

    // Subtle glow near the "hot" area
    ctx.globalAlpha = 0.25;
    ctx.shadowColor = 'hsl(270,100%,70%)';
    ctx.shadowBlur = 8;
    if (vertical) {
      ctx.fillRect(0, height * (1 - rm), width, Math.min(6, height));
    } else {
      ctx.fillRect(0, 0, Math.min(6, width), height);
    }
    ctx.globalAlpha = 1;
  }, [peakDb, rmsDb, vertical, width, height]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          width,
          height,
          borderRadius: 4,
          border: '1px solid hsl(220,20%,26%)',
        }}
      />
      {showLabel && (
        <div
          className="mt-1 text-[10px]"
          style={{ color: 'hsl(220,20%,70%)', userSelect: 'none' }}
        >
          {label ?? ''}
        </div>
      )}
    </div>
  );
};

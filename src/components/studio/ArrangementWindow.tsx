'use client';
import { useMemo, useRef, useEffect, useState } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { TrackStrip } from './TrackStrip';
import { MasterBus } from './MasterBus';

export interface ArrangementWindowProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
}

export const ArrangementWindow: React.FC<ArrangementWindowProps> = ({
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
}) => {
  const tracks = useAIStudioStore((s) => s.tracks);
  const bpm = useAIStudioStore((s) => s.bpm);

  const [pps, setPps] = useState(120);     // pixels per second
  const [scrollTime, setScrollTime] = useState(0);

  const rulerRef = useRef<HTMLCanvasElement | null>(null);

  // Draw top time ruler (bars + beats)
  useEffect(() => {
    const canvas = rulerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(W * devicePixelRatio));
    canvas.height = Math.max(1, Math.floor(H * devicePixelRatio));
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    // bg
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'hsl(220,20%,15%)');
    bg.addColorStop(1, 'hsl(220,20%,12%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const secondsPerBeat = 60 / (bpm || 120);
    const pxPerBeat = pps * secondsPerBeat;

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.fillStyle = 'hsl(220,20%,70%)';
    ctx.lineWidth = 1;

    // draw bars (every 4 beats)
    for (let x = -((scrollTime % (secondsPerBeat * 4)) * pps); x < W; x += pxPerBeat) {
      const beatIndex = Math.round((x + (scrollTime * pps)) / pxPerBeat);
      const isBar = beatIndex % 4 === 0;
      const lx = Math.floor(x) + 0.5;

      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, isBar ? H : H * 0.4);
      ctx.stroke();

      if (isBar) {
        const barNum = Math.floor(((scrollTime * pps) + x) / (pxPerBeat * 4)) + 1;
        if (barNum > 0) {
          ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.fillText(`${barNum}`, lx + 4, 10);
        }
      }
    }

    // Playhead
    const playX = (currentTime - scrollTime) * pps;
    if (playX >= 0 && playX <= W) {
      ctx.strokeStyle = 'hsl(180,100%,55%)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playX + 0.5, 0);
      ctx.lineTo(playX + 0.5, H);
      ctx.stroke();
    }
  }, [bpm, pps, scrollTime, currentTime]);

  // Simple continuous follow: keep playhead in left third when playing
  useEffect(() => {
    if (!isPlaying) return;
    const leftEdgeTime = scrollTime + (0.18 * (rulerRef.current?.clientWidth ?? 0)) / pps;
    const rightEdgeTime = scrollTime + (0.82 * (rulerRef.current?.clientWidth ?? 0)) / pps;

    if (currentTime < leftEdgeTime) setScrollTime(Math.max(0, currentTime - 1));
    if (currentTime > rightEdgeTime) setScrollTime(Math.max(0, currentTime - 2));
  }, [isPlaying, currentTime, pps, scrollTime]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* RULER */}
      <div className="border-b" style={{ borderColor: 'hsl(220,20%,22%)' }}>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-xs" style={{ color: 'hsl(220,20%,70%)' }}>
            {bpm} BPM • Zoom {pps}px/s
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'hsl(220,20%,70%)' }}>Zoom</span>
            <input type="range" min={60} max={480} step={10} value={pps} onChange={(e) => setPps(Number(e.target.value))} />
          </div>
        </div>
        <canvas ref={rulerRef} className="w-full" style={{ height: 18, display: 'block' }} />
      </div>

      {/* TRACKS */}
      <div className="flex-1 overflow-auto px-2 py-2">
        {tracks.length === 0 ? (
          <div
            className="rounded-md p-6 text-sm"
            style={{
              border: '1px dashed hsl(220,20%,26%)',
              color: 'hsl(220,20%,70%)',
              background: 'linear-gradient(180deg,hsl(220,20%,12%),hsl(220,20%,10%))',
            }}
          >
            No tracks yet — import audio or create a new track to begin.
          </div>
        ) : (
          tracks.map((t) => <TrackStrip key={t.id} trackId={t.id} />)
        )}
      </div>

      {/* MASTER BUS */}
      <div className="border-t p-2" style={{ borderColor: 'hsl(220,20%,22%)' }}>
        <MasterBus />
      </div>
    </div>
  );
};

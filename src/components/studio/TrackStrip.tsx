'use client';
import { useMemo, useRef, useEffect, useState } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { AudioMeter } from './VUMeter';
import { audioEngine } from '@/services/audioEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Headphones, Power, Waves, SlidersHorizontal } from 'lucide-react';

export interface TrackStripProps {
  trackId: string;
  height?: number;       // lane height
  showPlugins?: boolean;
  showSends?: boolean;
  compact?: boolean;
}

function dbFromLinear(v: number) {
  const x = Math.max(1e-6, v);
  return 20 * Math.log10(x);
}

export const TrackStrip: React.FC<TrackStripProps> = ({
  trackId,
  height = 120,
  showPlugins = true,
  showSends = true,
  compact = false,
}) => {
  const track = useAIStudioStore(
    (s) => s.tracks.find((t) => t.id === trackId)
  );
  const updateTrack = useAIStudioStore((s) => s.updateTrack);
  const updateTrackEffect = useAIStudioStore((s) => s.updateTrackEffect);
  const updateTrackSend = useAIStudioStore((s) => s.updateTrackSend);
  const selectTrack = useAIStudioStore((s) => s.selectTrack);
  const selectedTrackId = useAIStudioStore((s) => s.selectedTrackId);
  const snapEnabled = useAIStudioStore((s) => s.snapEnabled);
  const bpm = useAIStudioStore((s) => s.bpm);

  const isSelected = selectedTrackId === trackId;

  // Waveform canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelsPerSecond, setPPS] = useState(120); // default zoom

  // Draw waveform & regions whenever buffer/regions/pps changes
  useEffect(() => {
    if (!track) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(W * devicePixelRatio));
    canvas.height = Math.max(1, Math.floor(H * devicePixelRatio));
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    // Lane background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'hsl(220,20%,13%)');
    bg.addColorStop(1, 'hsl(220,20%,11%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid (beats) for subtle guidance
    const secondsPerBeat = 60 / (bpm || 120);
    const pxPerBeat = pixelsPerSecond * secondsPerBeat;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += pxPerBeat) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
      ctx.stroke();
    }

    // Regions: simple representation using track.waveformData or buffer
    const color = track.color ?? '#7dd3fc'; // cyan-ish fallback
    if (track.audioBuffer) {
      // Draw a simplified overview waveform from channel 0
      const ch = track.audioBuffer.getChannelData(0);
      const duration = track.audioBuffer.duration;
      const pxTotal = Math.max(1, Math.floor(duration * pixelsPerSecond));
      const step = Math.max(1, Math.floor(ch.length / pxTotal));
      const mid = H / 2;
      const amp = Math.max(6, H * 0.42);

      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (let x = 0; x < Math.min(pxTotal, W); x++) {
        const idx = x * step;
        let min = 1, max = -1;
        for (let i = 0; i < step; i++) {
          const v = ch[idx + i] ?? 0;
          if (v < min) min = v;
          if (v > max) max = v;
        }
        ctx.moveTo(x, mid + min * amp);
        ctx.lineTo(x, mid + max * amp);
      }
      ctx.stroke();

      ctx.globalAlpha = 1;
    }

    // Selection ring if track is selected
    if (isSelected) {
      ctx.strokeStyle = 'hsl(180,100%,55%)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, W - 2, H - 2);
    }
  }, [track?.audioBuffer, track?.regions, track?.color, bpm, pixelsPerSecond, isSelected]);

  if (!track) {
    return (
      <div
        className="rounded-md mb-2"
        style={{
          height,
          background: 'linear-gradient(180deg,hsl(220,20%,13%),hsl(220,20%,11%))',
          border: '1px solid hsl(220,20%,20%)',
        }}
      />
    );
  }

  const trackColor = track.color ?? 'hsl(200,100%,70%)';

  return (
    <div
      className="rounded-md mb-2 flex"
      style={{
        height,
        border: '1px solid hsl(220,20%,22%)',
        background: 'linear-gradient(180deg,hsl(220,20%,12%),hsl(220,20%,10%))',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -1px 3px rgba(0,0,0,0.3)',
      }}
    >
      {/* Controls Column */}
      <div
        className="flex flex-col gap-2 p-2"
        style={{
          width: compact ? 180 : 240,
          borderRight: '1px solid hsl(220,20%,22%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-medium" style={{ color: 'hsl(220,20%,85%)' }}>
            {track.name}
          </div>
          <Badge
            variant="outline"
            style={{ borderColor: 'hsl(220,20%,28%)', color: 'hsl(220,20%,70%)' }}
          >
            {track.type}
          </Badge>
        </div>

        {/* Meter + Fader/Pan */}
        <div className="flex items-end gap-2">
          <AudioMeter
            vertical
            width={12}
            height={compact ? 64 : 90}
            peakDb={track.peakLevel ?? -24}
            rmsDb={track.rmsLevel ?? -28}
          />

          <div className="flex-1">
            {/* Volume (0..1.5) */}
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="opacity-70" />
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.01}
                value={track.volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  updateTrack(track.id, { volume: v });
                }}
                style={{ width: '100%' }}
              />
              <div className="text-xs" style={{ color: 'hsl(220,20%,70%)', width: 48, textAlign: 'right' }}>
                {dbFromLinear(track.volume).toFixed(1)} dB
              </div>
            </div>

            {/* Pan (-1..1) */}
            <div className="flex items-center gap-2 mt-1">
              <Headphones size={14} className="opacity-70" />
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={track.pan}
                onChange={(e) => updateTrack(track.id, { pan: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div className="text-xs" style={{ color: 'hsl(220,20%,70%)', width: 48, textAlign: 'right' }}>
                {track.pan.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Sends (REV / DLY) */}
        {showSends && (
          <div className="flex gap-3 mt-1">
            {['reverb', 'delay'].map((busId) => {
              const amt = track.sends?.[busId]?.amount ?? 0;
              return (
                <div key={busId} className="flex-1">
                  <div className="text-[10px] mb-1" style={{ color: 'hsl(220,20%,65%)' }}>
                    {busId.toUpperCase()}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={amt}
                    onChange={(e) =>
                      updateTrackSend(track.id, busId, Number(e.target.value), track.sends?.[busId]?.preFader ?? false)
                    }
                    style={{ width: '100%' }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Plugin Mini-Bar */}
        {showPlugins && (
          <div
            className="mt-2 flex items-center gap-1 px-2 py-1 rounded"
            style={{
              background: 'linear-gradient(180deg,hsl(220,20%,14%),hsl(220,20%,12%))',
              border: '1px solid hsl(220,20%,24%)',
            }}
          >
            {(track.effects ?? [])
              .slice()
              .sort((a, b) => (a.rackPosition ?? 0) - (b.rackPosition ?? 0))
              .map((fx) => (
                <Button
                  key={fx.id}
                  size="sm"
                  variant={fx.enabled ? 'default' : 'outline'}
                  className="h-6 px-2 gap-1"
                  onClick={() => {
                    // placeholder: open plugin editor drawer in future
                  }}
                  onMouseDown={(e) => {
                    if (e.altKey) updateTrackEffect(track.id, fx.id, { enabled: !fx.enabled });
                  }}
                  title={
                    fx.enabled
                      ? `${fx.name} (Alt-click to bypass)`
                      : `${fx.name} (Alt-click to enable)`
                  }
                  style={{
                    background: fx.enabled
                      ? 'linear-gradient(180deg,hsl(270,90%,60%),hsl(270,80%,52%))'
                      : undefined,
                    borderColor: 'hsl(220,20%,26%)',
                  }}
                >
                  <SlidersHorizontal size={14} />
                  {!compact && <span className="text-xs">{fx.type.toUpperCase()}</span>}
                </Button>
              ))}
            {(!track.effects || track.effects.length === 0) && (
              <div className="text-[11px] opacity-70 flex items-center gap-1" style={{ color: 'hsl(220,20%,70%)' }}>
                <Waves size={14} /> No plugins
              </div>
            )}
          </div>
        )}

        {/* Row actions */}
        <div className="flex items-center justify-between mt-2">
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => selectTrack(track.id)}
          >
            Select
          </Button>
          <Badge
            variant="outline"
            style={{
              borderColor: 'hsl(220,20%,28%)',
              color: 'hsl(220,20%,70%)',
              background: track.frozen ? 'hsla(280,70%,55%,0.12)' : 'transparent',
            }}
          >
            {track.frozen ? 'Frozen' : 'Live'}
          </Badge>
        </div>
      </div>

      {/* Timeline Column */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block', cursor: 'default' }}
          onDoubleClick={() => selectTrack(track.id)}
        />
        {/* Simple zoom handle (placeholder) */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2 px-2 py-1 rounded"
          style={{ background: 'hsl(220,20%,12%)', border: '1px solid hsl(220,20%,24%)' }}>
          <span className="text-[10px]" style={{ color: 'hsl(220,20%,70%)' }}>Zoom</span>
          <input
            type="range"
            min={60}
            max={480}
            step={10}
            value={pixelsPerSecond}
            onChange={(e) => setPPS(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

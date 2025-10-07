import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track } from '@/stores/aiStudioStore';

interface WaveformTimelineProps {
  tracks: Track[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTrackUpdate: (id: string, updates: Partial<Track>) => void;
}

export const WaveformTimeline = ({
  tracks,
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
  onTrackUpdate,
}: WaveformTimelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [trackHeight, setTrackHeight] = useState(80);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  const trackHeaderWidth = 180;
  const pixelsPerSecond = 100 * zoom;

  // Generate simplified waveform data
  const generateWaveform = (type: Track['type']) => {
    const points = 100;
    const data: number[] = [];
    
    for (let i = 0; i < points; i++) {
      const t = i / points;
      let value = Math.random() * 0.5 + 0.3;
      
      // Add some shape based on track type
      if (type === 'drums') {
        value = Math.abs(Math.sin(t * 20)) * 0.8 + 0.2;
      } else if (type === 'bass') {
        value = Math.abs(Math.sin(t * 10)) * 0.6 + 0.3;
      } else if (type === 'vocal') {
        value = Math.sin(t * 15) * 0.4 + 0.6;
      }
      
      data.push(Math.min(1, Math.max(0, value)));
    }
    
    return data;
  };

  // Get color for track type
  const getTrackColor = (type: Track['type']) => {
    const colors: Record<Track['type'], string> = {
      vocal: 'hsl(var(--wave-vocal))',
      drums: 'hsl(var(--wave-drums))',
      bass: 'hsl(var(--wave-bass))',
      keys: 'hsl(var(--wave-keys))',
      guitar: 'hsl(var(--wave-guitar))',
      other: 'hsl(var(--wave-other))',
    };
    return colors[type] || colors.other;
  };

  // Draw waveforms on canvas
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

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--studio-black))';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid lines (measures)
    ctx.strokeStyle = 'hsl(var(--studio-border))';
    ctx.lineWidth = 1;
    
    const measureWidth = pixelsPerSecond * 4; // 4 seconds per measure at 120 BPM
    for (let i = 0; i < duration; i += 4) {
      const x = i * pixelsPerSecond;
      if (x > rect.width) break;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    // Draw tracks
    tracks.forEach((track, index) => {
      const y = index * trackHeight;
      const waveform = generateWaveform(track.type);
      const color = getTrackColor(track.type);
      
      // Draw track background
      if (hoveredTrack === track.id) {
        ctx.fillStyle = 'hsl(var(--studio-panel-raised))';
        ctx.fillRect(0, y, rect.width, trackHeight);
      }

      // Draw waveform
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      
      const regionWidth = duration * pixelsPerSecond;
      const stepWidth = regionWidth / waveform.length;
      
      for (let i = 0; i < waveform.length; i++) {
        const x = i * stepWidth;
        const amplitude = waveform[i];
        const barHeight = (trackHeight * 0.6) * amplitude;
        const barY = y + (trackHeight / 2) - (barHeight / 2);
        
        ctx.fillRect(x, barY, Math.max(2, stepWidth - 1), barHeight);
      }
      
      ctx.globalAlpha = 1;

      // Draw track separator
      ctx.strokeStyle = 'hsl(var(--studio-border))';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + trackHeight);
      ctx.lineTo(rect.width, y + trackHeight);
      ctx.stroke();
    });

    // Draw playhead
    const playheadX = currentTime * pixelsPerSecond;
    if (playheadX >= 0 && playheadX <= rect.width) {
      ctx.strokeStyle = 'hsl(var(--studio-accent))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, rect.height);
      ctx.stroke();
    }
  }, [tracks, currentTime, duration, zoom, trackHeight, pixelsPerSecond, hoveredTrack]);

  // Handle click to seek
  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    onTimeChange(Math.max(0, Math.min(duration, time)));
  };

  // Handle track hover
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const y = e.clientY - rect.top;
    const trackIndex = Math.floor(y / trackHeight);
    
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      setHoveredTrack(tracks[trackIndex].id);
    } else {
      setHoveredTrack(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--studio-black))]">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[hsl(var(--studio-panel))] border-b border-[hsl(var(--studio-border))]">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase tracking-wider">
            Arrangement
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
              className="p-1 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
            >
              <ZoomOut className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
            </button>
            <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))] min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(4, zoom + 0.5))}
              className="p-1 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
            >
              <ZoomIn className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">
            Track Height
          </span>
          <input
            type="range"
            min="60"
            max="120"
            value={trackHeight}
            onChange={(e) => setTrackHeight(Number(e.target.value))}
            className="w-24 accent-[hsl(var(--studio-accent))]"
          />
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="flex-shrink-0 bg-[hsl(var(--studio-panel))] border-r border-[hsl(var(--studio-border))]" style={{ width: trackHeaderWidth }}>
          {tracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                "flex items-center px-3 border-b border-[hsl(var(--studio-border))] transition",
                hoveredTrack === track.id && "bg-[hsl(var(--studio-panel-raised))]"
              )}
              style={{ height: trackHeight }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getTrackColor(track.type) }}
                />
                <span className="text-xs font-medium text-[hsl(var(--studio-text))] truncate">
                  {track.name}
                </span>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => onTrackUpdate(track.id, { solo: !track.solo })}
                  className={cn(
                    "w-5 h-5 text-[10px] font-bold rounded transition",
                    track.solo
                      ? "bg-[hsl(var(--led-yellow))] text-black"
                      : "bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]"
                  )}
                >
                  S
                </button>
                <button
                  onClick={() => onTrackUpdate(track.id, { mute: !track.mute })}
                  className={cn(
                    "w-5 h-5 text-[10px] font-bold rounded transition",
                    track.mute
                      ? "bg-[hsl(var(--led-red))] text-white"
                      : "bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]"
                  )}
                >
                  M
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Canvas */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={timelineRef}>
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: tracks.length * trackHeight }}
            onClick={handleTimelineClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredTrack(null)}
          />
        </div>
      </div>

      {/* Time Ruler */}
      <div className="h-8 bg-[hsl(var(--studio-panel))] border-t border-[hsl(var(--studio-border))] flex items-center px-4">
        <div className="flex-shrink-0" style={{ width: trackHeaderWidth }} />
        <div className="flex-1 relative">
          {Array.from({ length: Math.ceil(duration / 4) }).map((_, i) => {
            const time = i * 4;
            const x = time * pixelsPerSecond;
            return (
              <div
                key={i}
                className="absolute text-xs font-mono text-[hsl(var(--studio-text-dim))]"
                style={{ left: x }}
              >
                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

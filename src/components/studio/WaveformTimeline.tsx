import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track } from '@/stores/aiStudioStore';
import { TrackControls } from './TrackControls';

interface WaveformTimelineProps {
  tracks: Track[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTrackUpdate: (id: string, updates: Partial<Track>) => void;
  recordArmedTracks: Set<string>;
  onToggleRecordArm: (trackId: string) => void;
  onOpenTrackEffects: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
}

export const WaveformTimeline = ({
  tracks,
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
  onTrackUpdate,
  recordArmedTracks,
  onToggleRecordArm,
  onOpenTrackEffects,
  onDeleteTrack,
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

  // Get color for track type - Purple to Cyan gradient spectrum
  const getTrackColor = (type: Track['type']) => {
    const colors: Record<Track['type'], string> = {
      vocal: 'hsl(185, 100%, 50%)',
      drums: 'hsl(300, 90%, 65%)',
      bass: 'hsl(270, 100%, 70%)',
      keys: 'hsl(45, 95%, 55%)',
      guitar: 'hsl(330, 90%, 60%)',
      other: 'hsl(210, 100%, 55%)',
    };
    return colors[type] || colors.other;
  };

  // Helper to convert HSL to RGB for gradient
  const getRgbFromHsl = (hslString: string) => {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return { r: 255, g: 255, b: 255 };
    
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
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
      const trackY = index * trackHeight;
      const trackColor = getTrackColor(track.type);
      
      // Draw track background
      ctx.fillStyle = hoveredTrack === track.id 
        ? 'hsl(220, 16%, 20%)' 
        : 'hsl(220, 18%, 16%)';
      ctx.fillRect(0, trackY, rect.width, trackHeight);

      // Draw waveform with glass gradient fill
      const waveformData = track.waveformData || generateWaveform(track.type);
      const step = Math.max(1, Math.floor(waveformData.length / canvas.width));
      
      // Create glass gradient for waveform
      const gradient = ctx.createLinearGradient(0, trackY, 0, trackY + trackHeight);
      const rgb = getRgbFromHsl(trackColor);
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`);
      gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
      
      // Draw filled waveform
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, trackY + trackHeight / 2);
      
      for (let x = 0; x < canvas.width; x++) {
        const dataIndex = Math.floor(x * step);
        const amplitude = waveformData[dataIndex] || 0;
        const y = trackY + (trackHeight / 2) - (amplitude * trackHeight * 0.4);
        ctx.lineTo(x, y);
      }
      
      for (let x = canvas.width - 1; x >= 0; x--) {
        const dataIndex = Math.floor(x * step);
        const amplitude = waveformData[dataIndex] || 0;
        const y = trackY + (trackHeight / 2) + (amplitude * trackHeight * 0.4);
        ctx.lineTo(x, y);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add glass glow effect for peaks
      ctx.shadowColor = trackColor;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = trackColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = 0; x < canvas.width; x++) {
        const dataIndex = Math.floor(x * step);
        const amplitude = waveformData[dataIndex] || 0;
        const y = trackY + (trackHeight / 2) - (amplitude * trackHeight * 0.4);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw track separator
      ctx.strokeStyle = 'hsl(220, 14%, 28%)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, trackY + trackHeight);
      ctx.lineTo(rect.width, trackY + trackHeight);
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
    <div 
      className="flex flex-col h-full"
      style={{
        background: 'hsl(220, 20%, 14%)',
      }}
    >
      {/* Timeline Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          background: 'var(--panel-gradient)',
          borderColor: 'hsl(220, 14%, 28%)',
          boxShadow: 'var(--shadow-raised)',
        }}
      >
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
              
              <TrackControls
                track={track}
                isRecordArmed={recordArmedTracks.has(track.id)}
                onToggleRecordArm={() => onToggleRecordArm(track.id)}
                onOpenEffects={() => onOpenTrackEffects(track.id)}
                onDelete={() => onDeleteTrack(track.id)}
                onUpdate={(updates) => onTrackUpdate(track.id, updates)}
              />
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

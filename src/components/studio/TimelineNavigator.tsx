import { useRef, useEffect, useState } from 'react';
import { Track } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

interface TimelineNavigatorProps {
  tracks: Track[];
  duration: number;
  currentTime: number;
  viewportStart: number;
  viewportEnd: number;
  onViewportChange: (start: number, end: number) => void;
}

export const TimelineNavigator = ({
  tracks,
  duration,
  currentTime,
  viewportStart,
  viewportEnd,
  onViewportChange,
}: TimelineNavigatorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getTrackColor = (type: Track['type']) => {
    const colors: Partial<Record<Track['type'], string>> = {
      vocal: 'hsl(185, 100%, 50%)',
      drums: 'hsl(300, 90%, 65%)',
      bass: 'hsl(270, 100%, 70%)',
      keys: 'hsl(45, 95%, 55%)',
      guitar: 'hsl(330, 90%, 60%)',
      audio: 'hsl(200, 70%, 50%)',
      midi: 'hsl(300, 70%, 50%)',
      bus: 'hsl(0, 0%, 50%)',
      other: 'hsl(210, 100%, 55%)',
    };
    return colors[type] || colors.other || 'hsl(210, 100%, 55%)';
  };

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

    // Background
    ctx.fillStyle = 'hsl(220, 18%, 12%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw tracks as colored bars
    const trackHeight = rect.height / Math.max(1, tracks.length);
    tracks.forEach((track, index) => {
      const y = index * trackHeight;
      
      // Track background
      ctx.fillStyle = 'hsl(220, 16%, 16%)';
      ctx.fillRect(0, y, rect.width, trackHeight);

      // Regions
      track.regions.forEach((region) => {
        const x = (region.startTime / duration) * rect.width;
        const width = (region.duration / duration) * rect.width;
        
        ctx.fillStyle = getTrackColor(track.type);
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, y + 1, width, trackHeight - 2);
        ctx.globalAlpha = 1;
      });
    });

    // Viewport rectangle
    const viewportX = (viewportStart / duration) * rect.width;
    const viewportWidth = ((viewportEnd - viewportStart) / duration) * rect.width;
    
    ctx.strokeStyle = 'hsl(var(--studio-accent))';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, 0, viewportWidth, rect.height);
    ctx.fillStyle = 'hsl(var(--studio-accent) / 0.1)';
    ctx.fillRect(viewportX, 0, viewportWidth, rect.height);

    // Playhead
    const playheadX = (currentTime / duration) * rect.width;
    ctx.strokeStyle = 'hsl(var(--studio-accent))';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, rect.height);
    ctx.stroke();
  }, [tracks, duration, currentTime, viewportStart, viewportEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;

    const viewportDuration = viewportEnd - viewportStart;
    const newStart = Math.max(0, clickTime - viewportDuration / 2);
    const newEnd = Math.min(duration, newStart + viewportDuration);

    onViewportChange(newStart, newEnd);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;

    const viewportDuration = viewportEnd - viewportStart;
    const newStart = Math.max(0, clickTime - viewportDuration / 2);
    const newEnd = Math.min(duration, newStart + viewportDuration);

    onViewportChange(newStart, newEnd);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative border-b border-[hsl(220,14%,28%)] bg-[hsl(220,18%,14%)]",
        isDragging ? "cursor-grabbing" : "cursor-pointer"
      )}
      style={{ height: 60 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-1 left-2 text-[9px] text-[hsl(var(--studio-text-dim))] pointer-events-none">
        Overview
      </div>
    </div>
  );
};

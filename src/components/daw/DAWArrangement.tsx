import { useRef, useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

export const DAWArrangement = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracks = useAIStudioStore((state) => state.tracks);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const [pixelsPerSecond] = useState(100);
  const trackHeight = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(container.clientWidth, 5000); // Min 5000px for scrolling
    const height = tracks.length * trackHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, width, height);

    // Draw track backgrounds
    tracks.forEach((track, index) => {
      const y = index * trackHeight;
      
      // Alternating track background
      ctx.fillStyle = index % 2 === 0 ? 'hsl(var(--muted) / 0.3)' : 'hsl(var(--muted) / 0.1)';
      ctx.fillRect(0, y, width, trackHeight);
      
      // Track separator
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + trackHeight);
      ctx.lineTo(width, y + trackHeight);
      ctx.stroke();

      // Draw regions for this track
      track.regions.forEach((region) => {
        const regionX = region.startTime * pixelsPerSecond;
        const regionWidth = region.duration * pixelsPerSecond;
        const regionY = y + 5;
        const regionHeight = trackHeight - 10;

        // Region background
        ctx.fillStyle = track.color || 'hsl(var(--primary))';
        ctx.fillRect(regionX, regionY, regionWidth, regionHeight);

        // Region border
        ctx.strokeStyle = 'hsl(var(--background))';
        ctx.lineWidth = 2;
        ctx.strokeRect(regionX, regionY, regionWidth, regionHeight);

        // Waveform visualization (simplified)
        if (track.waveformData) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          const samplesPerPixel = Math.ceil(track.waveformData.length / regionWidth);
          for (let px = 0; px < regionWidth; px++) {
            const sampleIndex = Math.floor(px * samplesPerPixel);
            const sample = track.waveformData[sampleIndex] || 0;
            const waveY = regionY + regionHeight / 2 + (sample * regionHeight / 2);
            
            if (px === 0) {
              ctx.moveTo(regionX + px, waveY);
            } else {
              ctx.lineTo(regionX + px, waveY);
            }
          }
          ctx.stroke();
        }

        // Region name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '11px sans-serif';
        ctx.fillText(track.name, regionX + 5, regionY + 15);
      });
    });

    // Draw grid lines (beat markers)
    ctx.strokeStyle = 'hsl(var(--border) / 0.3)';
    ctx.lineWidth = 1;
    const secondsInView = width / pixelsPerSecond;
    for (let second = 0; second < secondsInView; second++) {
      const x = second * pixelsPerSecond;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw playhead
    const playheadX = currentTime * pixelsPerSecond;
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead triangle at top
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.closePath();
    ctx.fill();

  }, [tracks, currentTime, pixelsPerSecond]);

  return (
    <ScrollArea className="flex-1 bg-background">
      <div ref={containerRef} className="relative min-h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
      </div>
    </ScrollArea>
  );
};

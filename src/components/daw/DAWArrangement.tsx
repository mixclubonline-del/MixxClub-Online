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
      
      // Alternating track background with subtle gradient
      const gradient = ctx.createLinearGradient(0, y, 0, y + trackHeight);
      if (index % 2 === 0) {
        gradient.addColorStop(0, 'hsl(230, 35%, 10%)');
        gradient.addColorStop(1, 'hsl(230, 30%, 8%)');
      } else {
        gradient.addColorStop(0, 'hsl(230, 30%, 8%)');
        gradient.addColorStop(1, 'hsl(230, 35%, 10%)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, width, trackHeight);
      
      // Track separator with glow
      ctx.strokeStyle = 'hsl(270, 100%, 70%, 0.15)';
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

        // Region gradient background
        const regionGradient = ctx.createLinearGradient(regionX, regionY, regionX, regionY + regionHeight);
        const color = track.color || 'hsl(270, 100%, 70%)';
        regionGradient.addColorStop(0, color.replace(')', ', 0.8)').replace('hsl', 'hsla'));
        regionGradient.addColorStop(1, color.replace(')', ', 0.6)').replace('hsl', 'hsla'));
        ctx.fillStyle = regionGradient;
        ctx.fillRect(regionX, regionY, regionWidth, regionHeight);

        // Glow effect around region
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(regionX, regionY, regionWidth, regionHeight);
        ctx.shadowBlur = 0;

        // Top highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(regionX + 1, regionY + 1);
        ctx.lineTo(regionX + regionWidth - 1, regionY + 1);
        ctx.stroke();

        // Waveform visualization with glow
        if (track.waveformData) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          ctx.shadowBlur = 2;
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
          ctx.shadowBlur = 0;
        }

        // Region name with glow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(track.name, regionX + 8, regionY + 16);
        ctx.shadowBlur = 0;
      });
    });

    // Draw grid lines with subtle glow
    ctx.strokeStyle = 'hsl(270, 100%, 70%, 0.08)';
    ctx.lineWidth = 1;
    const secondsInView = width / pixelsPerSecond;
    for (let second = 0; second < secondsInView; second++) {
      const x = second * pixelsPerSecond;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw playhead with glow
    const playheadX = currentTime * pixelsPerSecond;
    
    // Playhead glow
    ctx.shadowColor = 'hsl(270, 100%, 70%)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'hsl(270, 100%, 70%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Playhead triangle at top with glow
    ctx.shadowColor = 'hsl(270, 100%, 70%)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'hsl(270, 100%, 70%)';
    ctx.beginPath();
    ctx.moveTo(playheadX - 8, 0);
    ctx.lineTo(playheadX + 8, 0);
    ctx.lineTo(playheadX, 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [tracks, currentTime, pixelsPerSecond]);

  return (
    <ScrollArea className="flex-1 bg-gradient-to-b from-[hsl(225,50%,5%)] to-[hsl(230,45%,7%)] relative">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      <div ref={containerRef} className="relative min-h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
      </div>
    </ScrollArea>
  );
};

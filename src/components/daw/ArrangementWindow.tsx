import { useRef, useEffect, useState } from 'react';
import { useAIStudioStore, Track, AudioRegion } from '@/stores/aiStudioStore';
import { Card } from '@/components/ui/card';
import { Music2 } from 'lucide-react';
import { AudioFileImporter } from '@/components/studio/AudioFileImporter';

interface ArrangementWindowProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
}

export const ArrangementWindow = ({
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
}: ArrangementWindowProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const tracks = useAIStudioStore((state) => state.tracks);
  const selectedTrackId = useAIStudioStore((state) => state.selectedTrackId);
  const selectedRegions = useAIStudioStore((state) => state.selectedRegions);
  const setSelectedTrack = useAIStudioStore((state) => state.setSelectedTrack);
  const selectRegion = useAIStudioStore((state) => state.selectRegion);
  const updateRegion = useAIStudioStore((state) => state.updateRegion);
  const tempo = useAIStudioStore((state) => state.tempo);

  const TRACK_HEIGHT = 120; // Larger tracks for better visibility
  const pixelsPerSecond = 100 * zoom;

  // Colors based on track type - Pro Tools inspired
  const getTrackColor = (type: Track['type']): string => {
    const colors: Record<Track['type'], string> = {
      vocal: 'hsl(280, 70%, 55%)', // Purple/Magenta
      guitar: 'hsl(15, 85%, 55%)',  // Orange/Red
      bass: 'hsl(220, 80%, 45%)',   // Deep Blue
      drums: 'hsl(140, 70%, 45%)',  // Green
      keys: 'hsl(180, 75%, 50%)',   // Cyan
      other: 'hsl(50, 90%, 55%)',   // Yellow
    };
    return colors[type] || colors.other;
  };

  // Draw playhead on ruler
  useEffect(() => {
    const canvas = rulerRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = 'hsl(220, 20%, 12%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Calculate bar and beat positions
    const beatsPerBar = 4;
    const secondsPerBeat = 60 / tempo;
    const secondsPerBar = secondsPerBeat * beatsPerBar;

    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    // Draw bars and beats
    for (let bar = 0; bar <= Math.ceil(duration / secondsPerBar); bar++) {
      const barTime = bar * secondsPerBar;
      const x = barTime * pixelsPerSecond;

      if (x > rect.width) break;

      // Bar line (emphasized)
      ctx.strokeStyle = 'hsl(220, 20%, 40%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();

      // Bar number
      ctx.fillStyle = 'hsl(220, 20%, 70%)';
      ctx.fillText(`${bar + 1}`, x + 5, 18);

      // Beat subdivisions
      for (let beat = 1; beat < beatsPerBar; beat++) {
        const beatX = x + (beat * secondsPerBeat * pixelsPerSecond);
        if (beatX > rect.width) break;

        ctx.strokeStyle = 'hsl(220, 20%, 28%)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beatX, rect.height * 0.3);
        ctx.lineTo(beatX, rect.height);
        ctx.stroke();
      }
    }

    // Draw playhead on ruler (PRECISE SYNC)
    const playheadX = currentTime * pixelsPerSecond;
    if (playheadX >= 0 && playheadX <= rect.width) {
      // Playhead line
      ctx.fillStyle = 'hsl(180, 100%, 50%)';
      ctx.shadowColor = 'hsl(180, 100%, 50%)';
      ctx.shadowBlur = 6;
      ctx.fillRect(playheadX - 1, 0, 3, rect.height);
      ctx.shadowBlur = 0;
      
      // Playhead triangle
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX - 6, 12);
      ctx.lineTo(playheadX + 6, 12);
      ctx.closePath();
      ctx.fill();
    }
  }, [duration, tempo, zoom, pixelsPerSecond, currentTime]); // Re-render on currentTime change for smooth playhead

  // Draw waveform canvas
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

    // Dark background
    ctx.fillStyle = 'hsl(220, 20%, 14%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw bar grid lines
    const beatsPerBar = 4;
    const secondsPerBeat = 60 / tempo;
    const secondsPerBar = secondsPerBeat * beatsPerBar;

    for (let bar = 0; bar <= Math.ceil(duration / secondsPerBar); bar++) {
      const x = bar * secondsPerBar * pixelsPerSecond;
      if (x > rect.width) break;

      ctx.strokeStyle = 'hsl(220, 20%, 20%)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    // Draw tracks
    tracks.forEach((track, index) => {
      const trackY = index * TRACK_HEIGHT;
      const trackColor = getTrackColor(track.type);
      const isSelected = selectedTrackId === track.id;

      // Track background
      ctx.fillStyle = isSelected 
        ? 'hsl(220, 20%, 18%)' 
        : index % 2 === 0 ? 'hsl(220, 20%, 15%)' : 'hsl(220, 20%, 16%)';
      ctx.fillRect(0, trackY, rect.width, TRACK_HEIGHT);

      // Track separator
      ctx.strokeStyle = 'hsl(220, 20%, 22%)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, trackY + TRACK_HEIGHT);
      ctx.lineTo(rect.width, trackY + TRACK_HEIGHT);
      ctx.stroke();

      // Draw regions
      track.regions.forEach((region) => {
        const regionX = region.startTime * pixelsPerSecond;
        const regionWidth = region.duration * pixelsPerSecond;
        const isRegionSelected = selectedRegions.has(region.id);
        const isHovered = hoveredRegion === region.id;

        // Region background with track color
        const alpha = isRegionSelected ? 0.5 : isHovered ? 0.4 : 0.3;
        ctx.fillStyle = trackColor.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
        ctx.fillRect(regionX, trackY + 10, regionWidth, TRACK_HEIGHT - 20);

        // Region border
        ctx.strokeStyle = isRegionSelected 
          ? 'hsl(180, 100%, 50%)' 
          : trackColor;
        ctx.lineWidth = isRegionSelected ? 3 : 2;
        ctx.strokeRect(regionX, trackY + 10, regionWidth, TRACK_HEIGHT - 20);

        // Draw waveform if available
        if (track.waveformData && track.waveformData.length > 0) {
          // Draw waveform with better visibility
          const waveformHeight = (TRACK_HEIGHT - 40) * 0.7;
          const centerY = trackY + TRACK_HEIGHT / 2;
          
          // Draw center line
          ctx.strokeStyle = 'hsl(220, 20%, 25%)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(regionX, centerY);
          ctx.lineTo(regionX + regionWidth, centerY);
          ctx.stroke();
          
          // Draw waveform
          ctx.strokeStyle = trackColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = trackColor;
          ctx.shadowBlur = 4;
          
          // Draw filled waveform
          ctx.beginPath();
          ctx.moveTo(regionX, centerY);
          
          const samplesPerPixel = track.waveformData.length / regionWidth;
          
          for (let px = 0; px < regionWidth; px++) {
            const startSample = Math.floor(px * samplesPerPixel);
            const endSample = Math.floor((px + 1) * samplesPerPixel);
            
            // Find max amplitude in this pixel's sample range
            let maxAmp = 0;
            for (let i = startSample; i < endSample && i < track.waveformData.length; i++) {
              const amp = Math.abs(track.waveformData[i] - 0.5);
              maxAmp = Math.max(maxAmp, amp);
            }
            
            const y = centerY - (maxAmp * waveformHeight);
            ctx.lineTo(regionX + px, y);
          }
          
          // Bottom half
          for (let px = regionWidth - 1; px >= 0; px--) {
            const startSample = Math.floor(px * samplesPerPixel);
            const endSample = Math.floor((px + 1) * samplesPerPixel);
            
            let maxAmp = 0;
            for (let i = startSample; i < endSample && i < track.waveformData.length; i++) {
              const amp = Math.abs(track.waveformData[i] - 0.5);
              maxAmp = Math.max(maxAmp, amp);
            }
            
            const y = centerY + (maxAmp * waveformHeight);
            ctx.lineTo(regionX + px, y);
          }
          
          ctx.closePath();
          
          // Fill with semi-transparent color
          const fillColor = trackColor.replace(')', ', 0.4)').replace('hsl', 'hsla');
          ctx.fillStyle = fillColor;
          ctx.fill();
          
          // Stroke outline
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Region name
        if (regionWidth > 50) {
          ctx.fillStyle = 'hsl(220, 20%, 90%)';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(
            track.name,
            regionX + 8,
            trackY + 28
          );

          // Duration display
          ctx.font = '10px monospace';
          ctx.fillStyle = 'hsl(220, 20%, 70%)';
          const durationText = `${region.duration.toFixed(2)}s`;
          ctx.fillText(durationText, regionX + 8, trackY + 42);
        }
      });
    });

    // Draw playhead
    const playheadX = currentTime * pixelsPerSecond;
    if (playheadX >= 0 && playheadX <= rect.width) {
      ctx.strokeStyle = 'hsl(180, 100%, 50%)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'hsl(180, 100%, 50%)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, rect.height);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [tracks, currentTime, duration, zoom, pixelsPerSecond, selectedTrackId, selectedRegions, hoveredRegion, tempo]);

  // Handle canvas clicks
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickTime = x / pixelsPerSecond;
    const trackIndex = Math.floor(y / TRACK_HEIGHT);

    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const track = tracks[trackIndex];
      setSelectedTrack(track.id);

      // Check if clicked on a region
      const clickedRegion = track.regions.find(
        (region) =>
          clickTime >= region.startTime &&
          clickTime <= region.startTime + region.duration
      );

      if (clickedRegion) {
        selectRegion(clickedRegion.id, e.shiftKey);
      } else {
        // Clicked on timeline ruler - seek
        onTimeChange(clickTime);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoverTime = x / pixelsPerSecond;
    const trackIndex = Math.floor(y / TRACK_HEIGHT);

    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const track = tracks[trackIndex];
      const hovered = track.regions.find(
        (region) =>
          hoverTime >= region.startTime &&
          hoverTime <= region.startTime + region.duration
      );
      setHoveredRegion(hovered?.id || null);
    } else {
      setHoveredRegion(null);
    }
  };

  const handleRulerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = rulerRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = Math.max(0, x / pixelsPerSecond);
    onTimeChange(clickTime);
  };

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'hsl(220, 20%, 14%)' }}>
        <Card className="p-12 text-center max-w-lg" style={{ background: 'hsl(220, 20%, 16%)' }}>
          <Music2 className="w-16 h-16 mx-auto mb-6 text-[hsl(180,100%,50%)]" />
          <h3 className="text-2xl font-bold mb-3">Start Your Session</h3>
          <p className="text-muted-foreground mb-6 text-base">
            Import your audio files to begin mixing and arranging
          </p>
          <AudioFileImporter />
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex overflow-hidden" 
      style={{ 
        background: 'linear-gradient(135deg, hsl(220, 20%, 16%) 0%, hsl(220, 20%, 14%) 50%, hsl(220, 20%, 12%) 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(255,255,255,0.02)',
      }}
    >
      {/* Arrangement Canvas with Spatial Depth */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          boxShadow: 'inset 2px 0 6px rgba(0,0,0,0.3)',
        }}
      >
        {/* Time Ruler with Depth */}
        <div 
          className="relative" 
          style={{ 
            height: '40px', 
            borderBottom: '1px solid hsl(220, 20%, 22%)',
            background: 'linear-gradient(180deg, hsl(220, 20%, 13%) 0%, hsl(220, 20%, 11%) 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          <canvas
            ref={rulerRef}
            onClick={handleRulerClick}
            className="w-full h-full cursor-pointer"
            style={{ display: 'block' }}
          />
        </div>

        {/* Tracks Canvas with Depth */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-auto"
          style={{
            background: 'linear-gradient(180deg, hsl(220, 20%, 14%) 0%, hsl(220, 20%, 13%) 100%)',
          }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-crosshair"
            style={{
              display: 'block',
              width: Math.max(containerRef.current?.clientWidth || 800, duration * pixelsPerSecond),
              height: tracks.length * TRACK_HEIGHT,
            }}
          />
        </div>
      </div>
    </div>
  );
};

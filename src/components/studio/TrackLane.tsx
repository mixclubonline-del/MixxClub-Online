import { useRef, useEffect } from 'react';
import { Track } from '@/stores/aiStudioStore';
import { renderWaveform } from '@/lib/waveform-renderer';

interface TrackLaneProps {
  track: Track;
  index: number;
  zoom: number;
  currentTime: number;
}

export const TrackLane = ({ track, index, zoom, currentTime }: TrackLaneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const laneHeight = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track.waveformData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.offsetWidth;
    const displayHeight = laneHeight;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Render waveform
    renderWaveform(ctx, track.waveformData, {
      width: displayWidth,
      height: displayHeight,
      color: track.color || 'hsl(180, 70%, 50%)',
      backgroundColor: 'transparent',
      progressColor: 'hsl(280, 70%, 60%)',
      progress: 0, // We'll use playhead overlay instead
    });

  }, [track.waveformData, track.color, zoom, laneHeight]);

  const trackColor = track.color || 'hsl(180, 70%, 50%)';

  return (
    <div 
      className="relative border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      style={{ height: `${laneHeight}px` }}
    >
      {/* Track Info */}
      <div className="absolute left-0 top-0 bottom-0 w-48 bg-[#0f1419] border-r border-white/10 flex items-center px-3 gap-3 z-10">
        <div 
          className="w-1 h-full rounded-full" 
          style={{ backgroundColor: trackColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {track.name}
          </p>
          <p className="text-xs text-white/40 capitalize">
            {track.type}
          </p>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="absolute left-48 right-0 top-0 bottom-0 overflow-hidden">
        {track.regions.map((region) => (
          <div
            key={region.id}
            className="absolute top-0 bottom-0 bg-black/20 border border-white/10 rounded overflow-hidden"
            style={{
              left: `${region.startTime * zoom}px`,
              width: `${region.duration * zoom}px`,
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
          </div>
        ))}
        
        {track.regions.length === 0 && track.waveformData && (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Meters */}
      <div className="absolute right-2 top-2 bottom-2 w-1.5 bg-black/40 rounded-full overflow-hidden">
        <div 
          className="absolute bottom-0 w-full bg-gradient-to-t from-green-400 via-yellow-400 to-red-500 transition-all duration-75"
          style={{ height: `${track.peakLevel * 100}%` }}
        />
      </div>
    </div>
  );
};

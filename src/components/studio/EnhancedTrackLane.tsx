import { useRef, useEffect } from 'react';
import { Track, AudioRegion } from '@/stores/aiStudioStore';
import { renderProfessionalWaveform } from '@/lib/waveform/professionalRenderer';

interface EnhancedTrackLaneProps {
  track: Track;
  zoom: number;
  trackHeight: number;
  currentTime: number;
  showWaveforms: boolean;
  pixelsPerSecond: number;
  onRegionClick?: (regionId: string) => void;
}

export const EnhancedTrackLane = ({
  track,
  zoom,
  trackHeight,
  currentTime,
  showWaveforms,
  pixelsPerSecond,
  onRegionClick
}: EnhancedTrackLaneProps) => {
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Render waveforms to canvas
  useEffect(() => {
    if (!showWaveforms || !track.waveformData) return;

    track.regions.forEach((region) => {
      const canvas = canvasRefs.current.get(region.id);
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const regionWidth = region.duration * pixelsPerSecond;
      
      // Set canvas size for high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = regionWidth * dpr;
      canvas.height = (trackHeight - 4) * dpr;
      canvas.style.width = `${regionWidth}px`;
      canvas.style.height = `${trackHeight - 4}px`;
      
      ctx.scale(dpr, dpr);

      // Calculate progress for this region
      const regionProgress = (currentTime - region.startTime) / region.duration;
      
      renderProfessionalWaveform(ctx, {
        width: regionWidth,
        height: trackHeight - 4,
        peaks: track.waveformData || [],
        color: track.color,
        progress: Math.max(0, Math.min(1, regionProgress)),
        showRMS: true,
        gradientColors: true
      });
    });
  }, [track, showWaveforms, pixelsPerSecond, trackHeight, currentTime]);

  return (
    <>
      {track.regions.map((region) => {
        const regionWidth = region.duration * pixelsPerSecond;
        
        return (
          <div
            key={region.id}
            className="absolute top-2 bottom-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] group ring-1 ring-white/10 hover:ring-primary/50 hover:shadow-lg"
            style={{
              left: `${region.startTime * pixelsPerSecond}px`,
              width: `${regionWidth}px`,
              background: showWaveforms && track.waveformData 
                ? 'rgba(0, 0, 0, 0.3)' 
                : `linear-gradient(135deg, ${track.color}, ${track.color}90)`,
              border: `1px solid ${track.color}40`
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRegionClick?.(region.id);
            }}
          >
            {showWaveforms && track.waveformData ? (
              <canvas
                ref={(el) => {
                  if (el) canvasRefs.current.set(region.id, el);
                }}
                className="absolute inset-0 w-full h-full rounded-lg"
              />
            ) : (
              <div className="h-full flex items-center justify-center px-2">
                <span className="text-xs text-white/90 font-semibold drop-shadow">
                  {track.audioBuffer ? '♪ Audio' : '🎤 Recording'}
                </span>
              </div>
            )}
            
            {/* Fade indicators */}
            <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
          </div>
        );
      })}
    </>
  );
};

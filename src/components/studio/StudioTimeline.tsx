import { useRef, useEffect, useState } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { TimeRuler } from './TimeRuler';
import { TrackLane } from './TrackLane';
import { Playhead } from './Playhead';
import { Button } from '@/components/ui/button';
import { Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { TrackControls } from './TrackControls';

export const StudioTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100); // pixels per second
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const { 
    tracks, 
    currentTime, 
    duration, 
    setCurrentTime, 
    isPlaying,
    snapEnabled,
    snapMode,
    tempo
  } = useAIStudioStore();

  // Auto-scroll during playback
  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;
    
    const container = containerRef.current;
    const playheadPosition = currentTime * zoom;
    const containerWidth = container.clientWidth;
    const viewportCenter = containerWidth / 2;
    
    // Keep playhead centered during playback
    if (playheadPosition > scrollLeft + viewportCenter) {
      container.scrollLeft = playheadPosition - viewportCenter;
      setScrollLeft(playheadPosition - viewportCenter);
    }
  }, [currentTime, isPlaying, zoom, scrollLeft]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left + scrollLeft;
    let newTime = clickX / zoom;
    
    // Apply snapping
    if (snapEnabled) {
      const beatDuration = 60 / tempo;
      const snapInterval = {
        bars: beatDuration * 4,
        beats: beatDuration,
        quarter: beatDuration / 4,
        eighth: beatDuration / 8,
        sixteenth: beatDuration / 16,
      }[snapMode];
      
      newTime = Math.round(newTime / snapInterval) * snapInterval;
    }
    
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(500, prev * 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(20, prev / 1.5));

  const timelineWidth = duration * zoom;

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0f1419] border-b border-white/10">
        <TrackControls />
        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomOut}
          className="text-white/70 hover:text-white"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-white/50 w-16 text-center">
          {Math.round(zoom)}px/s
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomIn}
          className="text-white/70 hover:text-white"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        onScroll={handleScroll}
      >
        <div 
          className="relative"
          style={{ width: `${timelineWidth}px`, minHeight: '100%' }}
          onClick={handleTimelineClick}
        >
          {/* Time Ruler */}
          <TimeRuler 
            duration={duration} 
            zoom={zoom} 
            tempo={tempo}
            snapMode={snapMode}
          />

          {/* Playhead */}
          <Playhead currentTime={currentTime} zoom={zoom} />

          {/* Track Lanes */}
          <div className="relative">
            {tracks.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-white/40">
                <div className="text-center">
                  <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tracks yet. Click "Add Track" to get started.</p>
                </div>
              </div>
            ) : (
              tracks.map((track, index) => (
                <TrackLane
                  key={track.id}
                  track={track}
                  index={index}
                  zoom={zoom}
                  currentTime={currentTime}
                />
              ))
            )}
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-white/5"
                style={{ left: `${i * zoom}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

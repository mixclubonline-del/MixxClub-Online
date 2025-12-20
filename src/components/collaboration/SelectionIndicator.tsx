import React, { memo } from 'react';
import type { SelectionRange } from '@/hooks/useRealtimeCursors';

interface SelectionIndicatorProps {
  selection: SelectionRange;
  color: string;
  userName: string;
  timelineScale?: number; // pixels per second
  timelineOffset?: number; // scroll offset in pixels
  trackHeight?: number;
  trackTop?: number;
}

const SelectionIndicator = memo(({
  selection,
  color,
  userName,
  timelineScale = 100,
  timelineOffset = 0,
  trackHeight,
  trackTop = 0
}: SelectionIndicatorProps) => {
  const { startTime, endTime, trackId } = selection;

  // Calculate pixel positions
  const startX = startTime * timelineScale - timelineOffset;
  const endX = endTime * timelineScale - timelineOffset;
  const width = endX - startX;

  // Don't render if selection is off-screen
  if (endX < 0 || startX > window.innerWidth) {
    return null;
  }

  // Duration label formatting
  const duration = endTime - startTime;
  const formatDuration = (seconds: number) => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toFixed(0).padStart(2, '0')}`;
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: Math.max(0, startX),
        top: trackTop,
        width: Math.max(2, width),
        height: trackHeight || '100%',
      }}
    >
      {/* Selection highlight */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          backgroundColor: `${color}20`,
          border: `1px solid ${color}60`,
        }}
      />

      {/* Left edge marker */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: color }}
      />

      {/* Right edge marker */}
      <div
        className="absolute right-0 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: color }}
      />

      {/* Selection label */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 
                   px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
        style={{
          backgroundColor: color,
          color: 'white',
        }}
      >
        <span className="max-w-[60px] truncate">{userName}</span>
        <span className="opacity-80">•</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Time markers at edges */}
      <div
        className="absolute -bottom-4 left-0 text-[9px] font-mono"
        style={{ color }}
      >
        {formatDuration(startTime)}
      </div>
      <div
        className="absolute -bottom-4 right-0 text-[9px] font-mono"
        style={{ color }}
      >
        {formatDuration(endTime)}
      </div>

      {/* Track indicator if specific track */}
      {trackId && (
        <div
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
});

SelectionIndicator.displayName = 'SelectionIndicator';

export default SelectionIndicator;

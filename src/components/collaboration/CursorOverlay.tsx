import React, { useRef, useEffect, useCallback } from 'react';
import RemoteCursor from './RemoteCursor';
import SelectionIndicator from './SelectionIndicator';
import type { RemoteCursorData, CursorPosition, SelectionRange } from '@/hooks/useRealtimeCursors';

interface CursorOverlayProps {
  remoteCursors: RemoteCursorData[];
  onCursorMove?: (position: CursorPosition) => void;
  onSelectionChange?: (selection: SelectionRange | null) => void;
  onFollowUser?: (userId: string | null) => void;
  followingUserId?: string | null;
  timelineScale?: number; // pixels per second
  timelineOffset?: number; // scroll offset in pixels
  className?: string;
  children?: React.ReactNode;
}

const CursorOverlay: React.FC<CursorOverlayProps> = ({
  remoteCursors,
  onCursorMove,
  onSelectionChange,
  onFollowUser,
  followingUserId,
  timelineScale = 100,
  timelineOffset = 0,
  className = '',
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const selectionStartRef = useRef<{ x: number; time: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !onCursorMove) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onCursorMove({
      x,
      y,
      timestamp: (x + timelineOffset) / timelineScale
    });

    // Handle selection drag
    if (isSelectingRef.current && selectionStartRef.current && onSelectionChange) {
      const currentTime = (x + timelineOffset) / timelineScale;
      const startTime = selectionStartRef.current.time;
      
      onSelectionChange({
        startTime: Math.min(startTime, currentTime),
        endTime: Math.max(startTime, currentTime)
      });
    }
  }, [onCursorMove, onSelectionChange, timelineScale, timelineOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || e.button !== 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x + timelineOffset) / timelineScale;
    
    isSelectingRef.current = true;
    selectionStartRef.current = { x, time };
  }, [timelineScale, timelineOffset]);

  const handleMouseUp = useCallback(() => {
    isSelectingRef.current = false;
    selectionStartRef.current = null;
  }, []);

  const handleFollowToggle = useCallback((userId: string) => {
    if (onFollowUser) {
      onFollowUser(followingUserId === userId ? null : userId);
    }
  }, [onFollowUser, followingUserId]);

  // Clear selection on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onSelectionChange) {
        onSelectionChange(null);
        isSelectingRef.current = false;
        selectionStartRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectionChange]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}

      {/* Remote cursors layer */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {remoteCursors.map((cursor) => (
          <RemoteCursor
            key={cursor.id}
            cursor={cursor}
            containerBounds={containerRef.current?.getBoundingClientRect()}
            onFollow={onFollowUser ? handleFollowToggle : undefined}
            isBeingFollowed={followingUserId === cursor.id}
          />
        ))}
      </div>

      {/* Selection indicators layer */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {remoteCursors
          .filter(cursor => cursor.selection)
          .map((cursor) => (
            <SelectionIndicator
              key={`selection-${cursor.id}`}
              selection={cursor.selection!}
              color={cursor.color}
              userName={cursor.name}
              timelineScale={timelineScale}
              timelineOffset={timelineOffset}
            />
          ))}
      </div>
    </div>
  );
};

export default CursorOverlay;

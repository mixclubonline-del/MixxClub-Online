import { useState, useCallback } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { useMusicalQuantization } from '@/hooks/useMusicalQuantization';

interface RegionHandleProps {
  regionId: string;
  position: 'start' | 'end';
  regionX: number;
  regionY: number;
  regionWidth: number;
  regionHeight: number;
  pixelsPerSecond: number;
  currentStartTime: number;
  currentDuration: number;
}

export const RegionHandle = ({
  regionId,
  position,
  regionX,
  regionY,
  regionWidth,
  regionHeight,
  pixelsPerSecond,
  currentStartTime,
  currentDuration,
}: RegionHandleProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [trimAmount, setTrimAmount] = useState(0);
  
  const trimRegionStart = useAIStudioStore((state) => state.trimRegionStart);
  const trimRegionEnd = useAIStudioStore((state) => state.trimRegionEnd);
  const { quantizeTime } = useMusicalQuantization();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX;
    const startTime = position === 'start' ? currentStartTime : currentStartTime + currentDuration;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / pixelsPerSecond;
      setTrimAmount(deltaTime);

      const newTime = quantizeTime(startTime + deltaTime);
      
      if (position === 'start') {
        trimRegionStart(regionId, Math.max(0, newTime));
      } else {
        trimRegionEnd(regionId, Math.max(currentStartTime + 0.01, newTime));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setTrimAmount(0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [regionId, position, pixelsPerSecond, currentStartTime, currentDuration, quantizeTime, trimRegionStart, trimRegionEnd]);

  const handleX = position === 'start' ? regionX : regionX + regionWidth - 8;

  return (
    <>
      <div
        className="absolute cursor-ew-resize hover:bg-[hsl(var(--studio-accent))] transition-colors z-10"
        style={{
          left: handleX,
          top: regionY + 4,
          width: 8,
          height: regionHeight - 8,
          background: isDragging ? 'hsl(var(--studio-accent))' : 'transparent',
        }}
        onMouseDown={handleMouseDown}
      />
      
      {/* Tooltip showing trim amount */}
      {isDragging && trimAmount !== 0 && (
        <div
          className="absolute px-2 py-1 bg-black/90 text-white text-xs rounded pointer-events-none z-20"
          style={{
            left: handleX,
            top: regionY - 24,
          }}
        >
          {trimAmount > 0 ? '+' : ''}{trimAmount.toFixed(3)}s
        </div>
      )}
    </>
  );
};

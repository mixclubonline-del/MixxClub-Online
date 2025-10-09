import { useState, useCallback } from 'react';
import { useAIStudioStore, AudioRegion } from '@/stores/aiStudioStore';

interface FadeHandleProps {
  regionId: string;
  type: 'in' | 'out';
  regionX: number;
  regionY: number;
  regionWidth: number;
  regionHeight: number;
  pixelsPerSecond: number;
  currentFade: AudioRegion['fadeIn'] | AudioRegion['fadeOut'];
  maxDuration: number;
}

const FADE_CURVES: Array<'linear' | 'exponential' | 'logarithmic'> = ['linear', 'exponential', 'logarithmic'];

export const FadeHandle = ({
  regionId,
  type,
  regionX,
  regionY,
  regionWidth,
  regionHeight,
  pixelsPerSecond,
  currentFade,
  maxDuration,
}: FadeHandleProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(currentFade.duration);
  
  const updateRegion = useAIStudioStore((state) => state.updateRegion);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX;
    const startDuration = currentFade.duration;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = type === 'in' ? moveEvent.clientX - startX : startX - moveEvent.clientX;
      const deltaTime = deltaX / pixelsPerSecond;
      const newDuration = Math.max(0, Math.min(maxDuration * 0.5, startDuration + deltaTime));
      
      setCurrentDuration(newDuration);
      
      updateRegion(regionId, {
        [type === 'in' ? 'fadeIn' : 'fadeOut']: {
          ...currentFade,
          duration: newDuration,
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [regionId, type, pixelsPerSecond, currentFade, maxDuration, updateRegion]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Cycle through fade curves
    const currentIndex = FADE_CURVES.indexOf(currentFade.curve);
    const nextCurve = FADE_CURVES[(currentIndex + 1) % FADE_CURVES.length];
    
    updateRegion(regionId, {
      [type === 'in' ? 'fadeIn' : 'fadeOut']: {
        ...currentFade,
        curve: nextCurve,
      },
    });
  }, [regionId, type, currentFade, updateRegion]);

  const fadeWidth = currentDuration * pixelsPerSecond;
  const handleX = type === 'in' ? regionX + fadeWidth : regionX + regionWidth - fadeWidth;

  return (
    <>
      {/* Fade visualization overlay */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: type === 'in' ? regionX : regionX + regionWidth - fadeWidth,
          top: regionY + 4,
          width: fadeWidth,
          height: regionHeight - 8,
          background: type === 'in'
            ? 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)'
            : 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)',
        }}
      />
      
      {/* Draggable handle */}
      <div
        className="absolute cursor-nw-resize hover:bg-[hsl(var(--studio-accent))] transition-colors z-10 group"
        style={{
          left: handleX - 6,
          top: regionY + 4,
          width: 12,
          height: 12,
          clipPath: type === 'in' 
            ? 'polygon(0 0, 100% 100%, 0 100%)'
            : 'polygon(100% 0, 100% 100%, 0 100%)',
          background: isDragging ? 'hsl(var(--studio-accent))' : 'rgba(185, 100, 255, 0.7)',
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        title={`${type === 'in' ? 'Fade In' : 'Fade Out'}: ${currentDuration.toFixed(3)}s (${currentFade.curve})`}
      />

      {/* Tooltip */}
      {isDragging && (
        <div
          className="absolute px-2 py-1 bg-black/90 text-white text-xs rounded pointer-events-none z-20"
          style={{
            left: handleX - 30,
            top: regionY - 24,
          }}
        >
          {type === 'in' ? 'Fade In' : 'Fade Out'}: {currentDuration.toFixed(2)}s
          <br />
          <span className="text-[10px] opacity-70">{currentFade.curve}</span>
        </div>
      )}
    </>
  );
};

import { useState, useCallback, useRef } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { useMusicalQuantization } from './useMusicalQuantization';

export const useRegionDrag = (pixelsPerSecond: number) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragRegionId, setDragRegionId] = useState<string | null>(null);
  const [ghostPosition, setGhostPosition] = useState<number | null>(null);
  
  const updateRegion = useAIStudioStore((state) => state.updateRegion);
  const selectedRegions = useAIStudioStore((state) => state.selectedRegions);
  const tracks = useAIStudioStore((state) => state.tracks);
  const { quantizeTime } = useMusicalQuantization();
  
  const dragStartTimeRef = useRef(0);

  const startDrag = useCallback((
    regionId: string,
    mouseX: number,
    regionStartTime: number
  ) => {
    setIsDragging(true);
    setDragStartX(mouseX);
    setDragRegionId(regionId);
    dragStartTimeRef.current = regionStartTime;
    setGhostPosition(regionStartTime);
  }, []);

  const onDrag = useCallback((mouseX: number) => {
    if (!isDragging || !dragRegionId) return;

    const deltaX = mouseX - dragStartX;
    const deltaTime = deltaX / pixelsPerSecond;
    const newTime = Math.max(0, dragStartTimeRef.current + deltaTime);
    const quantizedTime = quantizeTime(newTime);
    
    setGhostPosition(quantizedTime);
  }, [isDragging, dragRegionId, dragStartX, pixelsPerSecond, quantizeTime]);

  const endDrag = useCallback(() => {
    if (!isDragging || !dragRegionId || ghostPosition === null) {
      setIsDragging(false);
      setDragRegionId(null);
      setGhostPosition(null);
      return;
    }

    // Update all selected regions if multiple selected
    if (selectedRegions.has(dragRegionId) && selectedRegions.size > 1) {
      const timeDelta = ghostPosition - dragStartTimeRef.current;
      
      selectedRegions.forEach(regionId => {
        // Find the region
        for (const track of tracks) {
          const region = track.regions.find(r => r.id === regionId);
          if (region) {
            updateRegion(regionId, { 
              startTime: Math.max(0, region.startTime + timeDelta) 
            });
            break;
          }
        }
      });
    } else {
      // Single region move
      updateRegion(dragRegionId, { startTime: ghostPosition });
    }

    setIsDragging(false);
    setDragRegionId(null);
    setGhostPosition(null);
  }, [isDragging, dragRegionId, ghostPosition, selectedRegions, tracks, updateRegion]);

  return {
    isDragging,
    dragRegionId,
    ghostPosition,
    startDrag,
    onDrag,
    endDrag,
  };
};

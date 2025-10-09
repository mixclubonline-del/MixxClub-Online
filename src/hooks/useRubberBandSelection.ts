import { useState, useCallback, useRef } from 'react';
import { useAIStudioStore, Track } from '@/stores/aiStudioStore';

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const useRubberBandSelection = (
  tracks: Track[],
  pixelsPerSecond: number,
  trackHeight: number
) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const initialRegionsRef = useRef<Set<string>>(new Set());
  
  const selectRegion = useAIStudioStore((state) => state.selectRegion);
  const selectedRegions = useAIStudioStore((state) => state.selectedRegions);
  const clearSelection = useAIStudioStore((state) => state.clearSelection);

  const startSelection = useCallback((x: number, y: number, addToSelection: boolean) => {
    setIsSelecting(true);
    setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
    
    if (addToSelection) {
      initialRegionsRef.current = new Set(selectedRegions);
    } else {
      initialRegionsRef.current = new Set();
      clearSelection();
    }
  }, [selectedRegions, clearSelection]);

  const updateSelection = useCallback((x: number, y: number) => {
    if (!isSelecting || !selectionBox) return;

    setSelectionBox(prev => prev ? { ...prev, endX: x, endY: y } : null);

    // Calculate which regions intersect with selection box
    const box = {
      left: Math.min(selectionBox.startX, x),
      right: Math.max(selectionBox.startX, x),
      top: Math.min(selectionBox.startY, y),
      bottom: Math.max(selectionBox.startY, y),
    };

    const boxStartTime = box.left / pixelsPerSecond;
    const boxEndTime = box.right / pixelsPerSecond;
    const topTrackIndex = Math.floor(box.top / trackHeight);
    const bottomTrackIndex = Math.floor(box.bottom / trackHeight);

    // Find intersecting regions
    const intersectingRegions = new Set<string>();
    for (let i = topTrackIndex; i <= bottomTrackIndex && i < tracks.length; i++) {
      const track = tracks[i];
      track.regions.forEach(region => {
        const regionStart = region.startTime;
        const regionEnd = region.startTime + region.duration;
        
        // Check if region intersects with selection box
        if (regionEnd >= boxStartTime && regionStart <= boxEndTime) {
          intersectingRegions.add(region.id);
        }
      });
    }

    // Combine with initial selection if Shift held
    const finalSelection = new Set([...initialRegionsRef.current]);
    intersectingRegions.forEach(id => finalSelection.add(id));

    // Update selection
    clearSelection();
    finalSelection.forEach(id => selectRegion(id, true));
  }, [isSelecting, selectionBox, pixelsPerSecond, trackHeight, tracks, clearSelection, selectRegion]);

  const endSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionBox(null);
  }, []);

  const getSelectionBoxStyle = useCallback((): React.CSSProperties | null => {
    if (!selectionBox) return null;

    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);

    return {
      position: 'absolute',
      left,
      top,
      width,
      height,
      border: '2px dashed hsl(var(--studio-accent))',
      background: 'hsl(var(--studio-accent) / 0.1)',
      pointerEvents: 'none',
      zIndex: 1000,
    };
  }, [selectionBox]);

  return {
    isSelecting,
    selectionBox,
    startSelection,
    updateSelection,
    endSelection,
    getSelectionBoxStyle,
  };
};

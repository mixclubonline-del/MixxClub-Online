import { useCallback } from 'react';
import { useAIStudioStore, AudioRegion } from '@/stores/aiStudioStore';

/**
 * Hook for ripple editing functionality
 * When regions are deleted/trimmed, shift subsequent regions accordingly
 */
export const useRippleEdit = () => {
  const { 
    tracks, 
    updateTrack, 
    rippleMode, 
    selectedTrackId 
  } = useAIStudioStore();

  /**
   * Delete region with ripple editing
   */
  const deleteRegionWithRipple = useCallback((regionId: string) => {
    const store = useAIStudioStore.getState();
    
    // Find the region and its track
    let deletedRegion: AudioRegion | null = null;
    let deletedTrackId: string | null = null;

    for (const track of store.tracks) {
      const region = track.regions.find(r => r.id === regionId);
      if (region) {
        deletedRegion = region;
        deletedTrackId = track.id;
        break;
      }
    }

    if (!deletedRegion || !deletedTrackId) return;

    const deleteEndTime = deletedRegion.startTime + deletedRegion.duration;

    // Remove the region
    store.removeRegion(regionId);

    // Apply ripple based on mode
    if (store.rippleMode === 'off') {
      return; // No ripple, just delete
    }

    const tracksToRipple = store.rippleMode === 'all' 
      ? store.tracks
      : store.tracks.filter(t => t.id === deletedTrackId);

    // Shift all regions that start after the deleted region
    tracksToRipple.forEach(track => {
      const updatedRegions = track.regions.map(region => {
        if (region.startTime >= deleteEndTime) {
          return {
            ...region,
            startTime: region.startTime - deletedRegion.duration,
          };
        }
        return region;
      });

      store.updateTrack(track.id, { regions: updatedRegions });
    });
  }, [rippleMode, tracks, updateTrack, selectedTrackId]);

  /**
   * Trim region with ripple editing
   */
  const trimRegionWithRipple = useCallback((
    regionId: string,
    trimType: 'start' | 'end',
    newTime: number
  ) => {
    const store = useAIStudioStore.getState();

    // Find the region
    let targetRegion: AudioRegion | null = null;
    let targetTrackId: string | null = null;

    for (const track of store.tracks) {
      const region = track.regions.find(r => r.id === regionId);
      if (region) {
        targetRegion = region;
        targetTrackId = track.id;
        break;
      }
    }

    if (!targetRegion || !targetTrackId) return;

    const originalEndTime = targetRegion.startTime + targetRegion.duration;
    let rippleAmount = 0;
    let rippleStartTime = 0;

    if (trimType === 'start') {
      // Trimming start: move start forward
      const newStartTime = Math.max(newTime, targetRegion.startTime);
      const trimAmount = newStartTime - targetRegion.startTime;
      
      store.updateRegion(regionId, {
        startTime: newStartTime,
        sourceStartOffset: targetRegion.sourceStartOffset + trimAmount,
        duration: targetRegion.duration - trimAmount,
      });

      rippleAmount = trimAmount;
      rippleStartTime = originalEndTime;
    } else {
      // Trimming end: shorten duration
      const newDuration = Math.max(0.01, newTime - targetRegion.startTime);
      const trimAmount = targetRegion.duration - newDuration;
      
      store.updateRegion(regionId, {
        duration: newDuration,
      });

      rippleAmount = -trimAmount; // Negative because regions move left
      rippleStartTime = targetRegion.startTime + newDuration;
    }

    // Apply ripple if enabled
    if (store.rippleMode === 'off') return;

    const tracksToRipple = store.rippleMode === 'all'
      ? store.tracks
      : store.tracks.filter(t => t.id === targetTrackId);

    tracksToRipple.forEach(track => {
      const updatedRegions = track.regions.map(region => {
        if (region.id === regionId) return region; // Skip the trimmed region
        
        if (region.startTime >= rippleStartTime) {
          return {
            ...region,
            startTime: region.startTime + rippleAmount,
          };
        }
        return region;
      });

      store.updateTrack(track.id, { regions: updatedRegions });
    });
  }, [rippleMode, tracks, updateTrack]);

  return {
    deleteRegionWithRipple,
    trimRegionWithRipple,
  };
};

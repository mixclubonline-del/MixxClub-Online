import { useEffect, useCallback } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { useRippleEdit } from './useRippleEdit';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category: 'editing' | 'playback' | 'zoom' | 'selection' | 'transport';
  action: () => void;
}

/**
 * Centralized keyboard shortcuts hook for ProStudio
 */
export const useKeyboardShortcuts = () => {
  const {
    selectedRegions,
    currentTime,
    isPlaying,
    splitRegion,
    duplicateRegion,
    clearSelection,
    setPlaying,
    setCurrentTime,
    duration,
    tracks,
    updateRegion,
  } = useAIStudioStore();

  const { deleteRegionWithRipple } = useRippleEdit();

  // Define all shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Editing shortcuts
    {
      key: 's',
      description: 'Split regions at playhead',
      category: 'editing',
      action: () => {
        selectedRegions.forEach(regionId => splitRegion(regionId, currentTime));
      },
    },
    {
      key: 'b',
      description: 'Blade tool (split at click)',
      category: 'editing',
      action: () => {
        console.log('Blade tool activated - click regions to split');
      },
    },
    {
      key: 'r',
      description: 'Reverse selected regions',
      category: 'editing',
      action: () => {
        console.log('Reverse selected regions');
        // Implemented in batch operations
      },
    },
    {
      key: 'n',
      description: 'Normalize selected regions',
      category: 'editing',
      action: () => {
        console.log('Normalize selected regions');
        // Implemented in batch operations
      },
    },
    {
      key: '[',
      description: 'Trim region start to playhead',
      category: 'editing',
      action: () => {
        selectedRegions.forEach(regionId => {
          const region = tracks
            .flatMap(t => t.regions)
            .find(r => r.id === regionId);
          if (region && currentTime > region.startTime) {
            const trimAmount = currentTime - region.startTime;
            updateRegion(regionId, {
              startTime: currentTime,
              sourceStartOffset: region.sourceStartOffset + trimAmount,
              duration: region.duration - trimAmount,
            });
          }
        });
      },
    },
    {
      key: ']',
      description: 'Trim region end to playhead',
      category: 'editing',
      action: () => {
        selectedRegions.forEach(regionId => {
          const region = tracks
            .flatMap(t => t.regions)
            .find(r => r.id === regionId);
          if (region && currentTime > region.startTime && currentTime < region.startTime + region.duration) {
            updateRegion(regionId, {
              duration: currentTime - region.startTime,
            });
          }
        });
      },
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Duplicate selected regions',
      category: 'editing',
      action: () => {
        selectedRegions.forEach(regionId => duplicateRegion(regionId));
      },
    },
    {
      key: 'Delete',
      description: 'Delete selected regions',
      category: 'editing',
      action: () => {
        selectedRegions.forEach(regionId => deleteRegionWithRipple(regionId));
        clearSelection();
      },
    },
    {
      key: 'Backspace',
      description: 'Delete selected regions',
      category: 'editing',
      action: () => {
        selectedRegions.forEach(regionId => deleteRegionWithRipple(regionId));
        clearSelection();
      },
    },
    {
      key: 'Escape',
      description: 'Clear selection',
      category: 'selection',
      action: () => {
        clearSelection();
      },
    },

    // Playback shortcuts
    {
      key: ' ',
      description: 'Play/Pause',
      category: 'playback',
      action: () => {
        setPlaying(!isPlaying);
      },
    },
    {
      key: 'Enter',
      description: 'Return to start',
      category: 'playback',
      action: () => {
        setCurrentTime(0);
      },
    },
    {
      key: 'i',
      description: 'Set in point (not implemented)',
      category: 'playback',
      action: () => {
        console.log('Set in point at', currentTime);
      },
    },
    {
      key: 'o',
      description: 'Set out point (not implemented)',
      category: 'playback',
      action: () => {
        console.log('Set out point at', currentTime);
      },
    },

    // Selection shortcuts
    {
      key: 'a',
      ctrl: true,
      description: 'Select all regions',
      category: 'selection',
      action: () => {
        tracks.forEach(track => {
          track.regions.forEach(region => {
            useAIStudioStore.getState().selectRegion(region.id, true);
          });
        });
      },
    },
    {
      key: 'g',
      ctrl: true,
      description: 'Group selected regions (not implemented)',
      category: 'selection',
      action: () => {
        console.log('Group selected regions');
      },
    },

    // Zoom shortcuts
    {
      key: '=',
      description: 'Zoom in horizontal (not implemented)',
      category: 'zoom',
      action: () => {
        console.log('Zoom in');
      },
    },
    {
      key: '-',
      description: 'Zoom out horizontal (not implemented)',
      category: 'zoom',
      action: () => {
        console.log('Zoom out');
      },
    },
    {
      key: 'z',
      description: 'Zoom to fit all (not implemented)',
      category: 'zoom',
      action: () => {
        console.log('Zoom to fit all');
      },
    },
    {
      key: 'x',
      description: 'Zoom to selection (not implemented)',
      category: 'zoom',
      action: () => {
        console.log('Zoom to selection');
      },
    },
  ];

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, selectedRegions, currentTime, isPlaying]);

  return {
    shortcuts,
    getShortcutsByCategory: useCallback((category: KeyboardShortcut['category']) => {
      return shortcuts.filter(s => s.category === category);
    }, [shortcuts]),
  };
};

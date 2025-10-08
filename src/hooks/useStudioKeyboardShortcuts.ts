import { useEffect } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

export const useStudioKeyboardShortcuts = () => {
  const { 
    isPlaying,
    setPlaying, 
    setCurrentTime,
    tracks,
    removeTrack,
  } = useAIStudioStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Spacebar - Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(!isPlaying);
      }

      // R - Record (disabled for now)
      // if (e.key === 'r' || e.key === 'R') {
      //   e.preventDefault();
      // }

      // Home - Go to start
      if (e.code === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
      }

      // Delete/Backspace - Delete tracks (simplified for now)
      if ((e.key === 'Delete' || e.key === 'Backspace') && tracks.length > 0) {
        e.preventDefault();
        console.log('Delete track shortcut - not yet implemented with selection');
      }

      // Cmd/Ctrl + S - Manual save (handled by parent component)
      if (modifier && e.key === 's') {
        e.preventDefault();
        console.log('Manual save triggered');
      }

      // Cmd/Ctrl + Z - Undo (TODO: implement undo/redo)
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        console.log('Undo');
      }

      // Cmd/Ctrl + Shift + Z - Redo
      if (modifier && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        console.log('Redo');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    isPlaying,
    setPlaying,
    setCurrentTime,
    tracks,
    removeTrack,
  ]);
};

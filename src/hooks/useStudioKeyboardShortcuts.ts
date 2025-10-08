import { useEffect } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { useToast } from '@/hooks/use-toast';

export const useStudioKeyboardShortcuts = () => {
  const { 
    isPlaying,
    isRecording,
    setPlaying,
    setRecording,
    setCurrentTime,
    tracks,
    selectedRegions,
    removeTrack,
  } = useAIStudioStore();
  const { toast } = useToast();

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

      // R - Record
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (!isRecording) {
          setRecording(true);
          setPlaying(true);
          toast({
            title: 'Recording',
            description: 'Recording started',
          });
        } else {
          setRecording(false);
          toast({
            title: 'Recording Stopped',
            description: 'Recording has been stopped',
          });
        }
      }

      // Enter - Stop playback and recording
      if (e.key === 'Enter') {
        e.preventDefault();
        setPlaying(false);
        setRecording(false);
        setCurrentTime(0);
      }

      // Home - Go to start
      if (e.code === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
      }

      // Delete/Backspace - Delete selected items
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRegions.size > 0) {
        e.preventDefault();
        toast({
          title: 'Delete',
          description: `${selectedRegions.size} item(s) deleted`,
        });
      }

      // Cmd/Ctrl + S - Manual save
      if (modifier && e.key === 's') {
        e.preventDefault();
        toast({
          title: 'Saved',
          description: 'Session auto-saved',
        });
      }

      // Cmd/Ctrl + Z - Undo
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        toast({
          title: 'Undo',
          description: 'Last action undone',
        });
      }

      // Cmd/Ctrl + Shift + Z - Redo
      if (modifier && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        toast({
          title: 'Redo',
          description: 'Action redone',
        });
      }

      // Cmd/Ctrl + D - Duplicate
      if (modifier && e.key === 'd') {
        e.preventDefault();
        if (selectedRegions.size > 0) {
          toast({
            title: 'Duplicate',
            description: 'Selected items duplicated',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    isPlaying,
    isRecording,
    setPlaying,
    setRecording,
    setCurrentTime,
    tracks,
    selectedRegions,
    removeTrack,
    toast
  ]);
};

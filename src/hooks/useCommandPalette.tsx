import { useState, useCallback } from 'react';
import { useFlowNavigation } from '@/core/fabric/useFlow';

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { navigateTo, openArtistCRM } = useFlowNavigation();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const executeCommand = useCallback((command: string) => {
    // Parse and execute commands
    const commands: Record<string, () => void> = {
      'upload': () => openArtistCRM('active-work'),
      'mix': () => navigateTo('/mixing'),
      'session': () => openArtistCRM('studio'),
      'engineer': () => navigateTo('/engineer-directory'),
      'mastering': () => navigateTo('/mastering'),
      'achievements': () => openArtistCRM('profile'),
      'profile': () => openArtistCRM('profile'),
      'dashboard': () => openArtistCRM(),
    };

    const action = commands[command.toLowerCase()];
    if (action) {
      action();
      close();
    }
  }, [navigateTo, openArtistCRM, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    executeCommand
  };
};

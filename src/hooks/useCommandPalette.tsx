import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const executeCommand = useCallback((command: string) => {
    // Parse and execute commands
    const commands: Record<string, () => void> = {
      'upload': () => navigate('/artist-crm?tab=active-work'),
      'mix': () => navigate('/mixing'),
      'session': () => navigate('/artist-crm?tab=studio'),
      'engineer': () => navigate('/engineer-directory'),
      'mastering': () => navigate('/mastering'),
      'achievements': () => navigate('/artist-crm?tab=profile'),
      'profile': () => navigate('/artist-crm?tab=profile'),
      'dashboard': () => navigate('/artist-crm'),
    };

    const action = commands[command.toLowerCase()];
    if (action) {
      action();
      close();
    }
  }, [navigate, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    executeCommand
  };
};
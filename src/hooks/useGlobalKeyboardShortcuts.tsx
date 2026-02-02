import { useEffect, useCallback } from 'react';
import { useFlowNavigation } from '@/core/fabric/useFlow';

interface ShortcutConfig {
  enabled?: boolean;
  onCommandPalette?: () => void;
  onNewSession?: () => void;
  onTogglePrime?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = (config: ShortcutConfig = {}) => {
  const {
    enabled = true,
    onCommandPalette,
    onNewSession,
    onTogglePrime,
    onSearch,
  } = config;

  const { navigateTo } = useFlowNavigation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            if (onCommandPalette) {
              onCommandPalette();
            } else {
              navigateTo('/search');
            }
            break;
          case 'n':
            e.preventDefault();
            if (onNewSession) {
              onNewSession();
            } else {
              navigateTo('/create-session');
            }
            break;
          case '/':
            e.preventDefault();
            onTogglePrime?.();
            break;
          case 'f':
            if (e.shiftKey) {
              e.preventDefault();
              if (onSearch) {
                onSearch();
              } else {
                navigateTo('/search');
              }
            }
            break;
        }
      }

      // Non-modifier shortcuts
      switch (e.key) {
        case 'Escape':
          // Could close modals, etc.
          break;
        case '?':
          if (e.shiftKey) {
            // Show keyboard shortcuts help
          }
          break;
      }
    },
    [enabled, navigateTo, onCommandPalette, onNewSession, onTogglePrime, onSearch]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search / command palette' },
      { keys: ['⌘', 'N'], description: 'Create new session' },
      { keys: ['⌘', '/'], description: 'Toggle Prime assistant' },
      { keys: ['⌘', '⇧', 'F'], description: 'Global search' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  };
};

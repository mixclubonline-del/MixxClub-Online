import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// Default studio shortcuts
export const defaultStudioShortcuts = (actions: {
  play: () => void;
  stop: () => void;
  record: () => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
  duplicate: () => void;
  delete: () => void;
  cut: () => void;
  copy: () => void;
  paste: () => void;
}): KeyboardShortcut[] => [
  { key: ' ', action: actions.play, description: 'Play/Pause' },
  { key: 'Enter', action: actions.stop, description: 'Stop' },
  { key: 'r', action: actions.record, description: 'Record' },
  { key: 'z', ctrl: true, action: actions.undo, description: 'Undo' },
  { key: 'z', ctrl: true, shift: true, action: actions.redo, description: 'Redo' },
  { key: 's', ctrl: true, action: actions.save, description: 'Save' },
  { key: 'd', ctrl: true, action: actions.duplicate, description: 'Duplicate' },
  { key: 'Delete', action: actions.delete, description: 'Delete' },
  { key: 'x', ctrl: true, action: actions.cut, description: 'Cut' },
  { key: 'c', ctrl: true, action: actions.copy, description: 'Copy' },
  { key: 'v', ctrl: true, action: actions.paste, description: 'Paste' }
];

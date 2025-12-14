import { useKeyboardShortcuts } from '@/hooks/useGlobalKeyboardShortcuts';

export const GlobalKeyboardShortcuts = () => {
  // Global keyboard shortcuts - Cmd/Ctrl+K for search, Cmd/Ctrl+N for new session
  useKeyboardShortcuts({ enabled: true });
  
  return null;
};

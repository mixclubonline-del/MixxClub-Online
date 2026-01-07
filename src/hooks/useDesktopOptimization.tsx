import { useEffect, useCallback } from 'react';
import { useDeviceContext } from './useDeviceContext';
import { getModifierKey, formatShortcut } from '@/lib/platform';

interface DesktopOptimizationConfig {
  enableKeyboardHints?: boolean;
  enableContextMenu?: boolean;
  enableDragDrop?: boolean;
}

interface DesktopOptimization {
  // Platform-specific helpers
  modifierKey: { key: string; symbol: string };
  formatShortcut: (keys: string[]) => string;
  
  // Feature flags
  showKeyboardHints: boolean;
  enableHoverStates: boolean;
  enableRightClick: boolean;
  enableDragDrop: boolean;
  
  // UI helpers
  getTooltipShortcut: (shortcut: string[]) => string;
  shouldShowFocusRing: boolean;
}

export const useDesktopOptimization = (
  config: DesktopOptimizationConfig = {}
): DesktopOptimization => {
  const {
    enableKeyboardHints = true,
    enableContextMenu = true,
    enableDragDrop = true,
  } = config;
  
  const { experienceMode, hasMousePrecision, isDesktop, isUltrawide, platform } = useDeviceContext();
  
  const isDesktopExperience = experienceMode === 'desktop-compact' || 
                               experienceMode === 'desktop-full' || 
                               experienceMode === 'ultrawide';

  // Keyboard navigation detection
  useEffect(() => {
    if (!isDesktopExperience) return;
    
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
    };
    
    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isDesktopExperience]);

  const modifierKey = getModifierKey();
  
  const getTooltipShortcut = useCallback((shortcut: string[]): string => {
    if (!enableKeyboardHints || !isDesktopExperience) return '';
    return formatShortcut(shortcut);
  }, [enableKeyboardHints, isDesktopExperience]);

  return {
    modifierKey,
    formatShortcut,
    showKeyboardHints: enableKeyboardHints && isDesktopExperience,
    enableHoverStates: hasMousePrecision,
    enableRightClick: enableContextMenu && isDesktopExperience,
    enableDragDrop: enableDragDrop && isDesktopExperience,
    getTooltipShortcut,
    shouldShowFocusRing: isDesktopExperience,
  };
};

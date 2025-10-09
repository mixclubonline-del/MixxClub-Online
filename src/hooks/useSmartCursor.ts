import { useState, useCallback, useEffect } from 'react';

export type CursorMode = 
  | 'select' // Default selection
  | 'move' // Move region
  | 'trim-start' // Trim start edge
  | 'trim-end' // Trim end edge
  | 'fade-in' // Adjust fade in
  | 'fade-out' // Adjust fade out
  | 'slip' // Slip audio (Alt key)
  | 'copy' // Copy-drag (Cmd key);

export interface CursorState {
  mode: CursorMode;
  cursor: string; // CSS cursor value
}

/**
 * Smart cursor hook - context-aware cursor that changes based on position and modifiers
 */
export const useSmartCursor = () => {
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: 'select',
    cursor: 'default',
  });

  const [modifierKeys, setModifierKeys] = useState({
    alt: false,
    cmd: false,
    shift: false,
  });

  // Track modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setModifierKeys(prev => ({
        ...prev,
        alt: e.altKey,
        cmd: e.metaKey || e.ctrlKey,
        shift: e.shiftKey,
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setModifierKeys(prev => ({
        ...prev,
        alt: e.altKey,
        cmd: e.metaKey || e.ctrlKey,
        shift: e.shiftKey,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * Calculate cursor mode based on position within region and modifier keys
   * @param relativeY - Y position relative to region height (0-1)
   * @param relativeX - X position relative to region width (0-1)
   * @param edgeThreshold - Threshold for edge detection (default 10%)
   */
  const calculateCursorMode = useCallback((
    relativeY: number,
    relativeX: number,
    edgeThreshold: number = 0.1
  ): CursorState => {
    // Modifier key overrides
    if (modifierKeys.alt) {
      return { mode: 'slip', cursor: 'grab' };
    }
    if (modifierKeys.cmd) {
      return { mode: 'copy', cursor: 'copy' };
    }

    // Edge detection - left/right edges for trim
    if (relativeX < edgeThreshold) {
      return { mode: 'trim-start', cursor: 'ew-resize' };
    }
    if (relativeX > 1 - edgeThreshold) {
      return { mode: 'trim-end', cursor: 'ew-resize' };
    }

    // Vertical zones - top for fades, middle/bottom for move
    if (relativeY < 0.25) {
      // Top quarter - fade in/out based on horizontal position
      if (relativeX < 0.3) {
        return { mode: 'fade-in', cursor: 'nw-resize' };
      } else if (relativeX > 0.7) {
        return { mode: 'fade-out', cursor: 'ne-resize' };
      }
    }

    // Default: move
    return { mode: 'move', cursor: 'move' };
  }, [modifierKeys]);

  /**
   * Update cursor state based on hover position
   */
  const updateCursor = useCallback((
    mouseX: number,
    mouseY: number,
    regionLeft: number,
    regionTop: number,
    regionWidth: number,
    regionHeight: number
  ) => {
    const relativeX = (mouseX - regionLeft) / regionWidth;
    const relativeY = (mouseY - regionTop) / regionHeight;

    const newState = calculateCursorMode(relativeY, relativeX);
    setCursorState(newState);
  }, [calculateCursorMode]);

  /**
   * Reset cursor to default
   */
  const resetCursor = useCallback(() => {
    setCursorState({ mode: 'select', cursor: 'default' });
  }, []);

  /**
   * Get cursor CSS class based on mode
   */
  const getCursorClass = useCallback((): string => {
    const cursorMap: Record<CursorMode, string> = {
      'select': 'cursor-default',
      'move': 'cursor-move',
      'trim-start': 'cursor-ew-resize',
      'trim-end': 'cursor-ew-resize',
      'fade-in': 'cursor-nw-resize',
      'fade-out': 'cursor-ne-resize',
      'slip': 'cursor-grab',
      'copy': 'cursor-copy',
    };
    return cursorMap[cursorState.mode];
  }, [cursorState.mode]);

  return {
    cursorState,
    modifierKeys,
    updateCursor,
    resetCursor,
    getCursorClass,
  };
};

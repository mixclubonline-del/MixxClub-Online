import { useState, useCallback, useRef, useEffect } from 'react';

export interface UndoRedoOptions {
  maxHistory?: number;
  debounceMs?: number;
}

export const useUndoRedo = <T,>(
  initialState: T,
  options: UndoRedoOptions = {}
) => {
  const { maxHistory = 50, debounceMs = 300 } = options;
  
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    // Clear any pending debounced updates
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const currentState = prev[currentIndex];
        const nextState = typeof newState === 'function' 
          ? (newState as (prev: T) => T)(currentState)
          : newState;
        
        // Don't add to history if state hasn't changed
        if (JSON.stringify(currentState) === JSON.stringify(nextState)) {
          return prev;
        }
        
        // Remove any states after current index (if we're not at the end)
        const newHistory = [...prev.slice(0, currentIndex + 1), nextState];
        
        // Limit history size
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          setCurrentIndex(prev => prev); // Keep index at the same relative position
          return newHistory;
        }
        
        setCurrentIndex(newHistory.length - 1);
        return newHistory;
      });
    }, debounceMs);
  }, [currentIndex, maxHistory, debounceMs]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const clear = useCallback(() => {
    setHistory([history[currentIndex]]);
    setCurrentIndex(0);
  }, [history, currentIndex]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    state: history[currentIndex],
    setState,
    undo,
    redo,
    clear,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    historySize: history.length,
    currentIndex
  };
};

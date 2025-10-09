import { useState, useCallback } from 'react';

interface ZoomState {
  horizontal: number;
  vertical: number;
}

interface ZoomHistory {
  horizontal: number;
  vertical: number;
  timestamp: number;
}

export const useZoomControls = (initialZoom: number = 1) => {
  const [zoom, setZoom] = useState<ZoomState>({
    horizontal: initialZoom,
    vertical: 1,
  });
  
  const [zoomHistory, setZoomHistory] = useState<ZoomHistory[]>([
    { horizontal: initialZoom, vertical: 1, timestamp: Date.now() }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushToHistory = useCallback((newZoom: ZoomState) => {
    const newHistory = zoomHistory.slice(0, historyIndex + 1);
    newHistory.push({ ...newZoom, timestamp: Date.now() });
    
    // Keep last 20 zoom states
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setZoomHistory(newHistory);
  }, [zoomHistory, historyIndex]);

  const setHorizontalZoom = useCallback((value: number) => {
    const newZoom = { ...zoom, horizontal: Math.max(0.1, Math.min(10, value)) };
    setZoom(newZoom);
    pushToHistory(newZoom);
  }, [zoom, pushToHistory]);

  const setVerticalZoom = useCallback((value: number) => {
    const newZoom = { ...zoom, vertical: Math.max(0.5, Math.min(3, value)) };
    setZoom(newZoom);
    pushToHistory(newZoom);
  }, [zoom, pushToHistory]);

  const zoomIn = useCallback((axis: 'horizontal' | 'vertical' = 'horizontal') => {
    if (axis === 'horizontal') {
      setHorizontalZoom(zoom.horizontal + 0.5);
    } else {
      setVerticalZoom(zoom.vertical + 0.2);
    }
  }, [zoom, setHorizontalZoom, setVerticalZoom]);

  const zoomOut = useCallback((axis: 'horizontal' | 'vertical' = 'horizontal') => {
    if (axis === 'horizontal') {
      setHorizontalZoom(zoom.horizontal - 0.5);
    } else {
      setVerticalZoom(zoom.vertical - 0.2);
    }
  }, [zoom, setHorizontalZoom, setVerticalZoom]);

  const zoomToFit = useCallback((duration: number, viewportWidth: number) => {
    const optimalZoom = (viewportWidth / duration) / 100;
    setHorizontalZoom(Math.max(0.1, Math.min(10, optimalZoom)));
  }, [setHorizontalZoom]);

  const zoomToSelection = useCallback((
    selectionStart: number,
    selectionEnd: number,
    viewportWidth: number
  ) => {
    const selectionDuration = selectionEnd - selectionStart;
    if (selectionDuration <= 0) return;
    
    const optimalZoom = (viewportWidth / selectionDuration) / 100;
    setHorizontalZoom(Math.max(0.1, Math.min(10, optimalZoom)));
  }, [setHorizontalZoom]);

  const undoZoom = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setZoom(zoomHistory[newIndex]);
    }
  }, [historyIndex, zoomHistory]);

  const redoZoom = useCallback(() => {
    if (historyIndex < zoomHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setZoom(zoomHistory[newIndex]);
    }
  }, [historyIndex, zoomHistory]);

  return {
    zoom,
    zoomIn,
    zoomOut,
    setHorizontalZoom,
    setVerticalZoom,
    zoomToFit,
    zoomToSelection,
    undoZoom,
    redoZoom,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < zoomHistory.length - 1,
  };
};

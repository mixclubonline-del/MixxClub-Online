import { useEffect, useRef, useState, useCallback } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface GestureState {
  zoom: number;
  pan: number;
  markers: number[];
}

interface Touch {
  x: number;
  y: number;
  timestamp: number;
}

export const useGestureControls = (containerRef: React.RefObject<HTMLElement>) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    zoom: 1,
    pan: 0,
    markers: [],
  });

  const touchStartRef = useRef<Touch[]>([]);
  const lastTapRef = useRef<number>(0);
  const initialPinchDistanceRef = useRef<number>(0);
  const initialZoomRef = useRef<number>(1);
  const swipeStartRef = useRef<number>(0);

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchData = (touch: React.Touch): Touch => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now(),
  });

  const triggerHaptic = useCallback(async (style: ImpactStyle) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Haptics not available
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches).map(t => getTouchData(t as any));
    touchStartRef.current = touches;

    if (touches.length === 2) {
      // Pinch start
      initialPinchDistanceRef.current = getDistance(touches[0], touches[1]);
      initialZoomRef.current = gestureState.zoom;
    } else if (touches.length === 1) {
      // Potential swipe or tap
      swipeStartRef.current = touches[0].x;
      
      // Double-tap detection
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected - add marker
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const relativeX = (touches[0].x - rect.left) / rect.width;
          setGestureState(prev => ({
            ...prev,
            markers: [...prev.markers, relativeX].sort((a, b) => a - b),
          }));
          triggerHaptic(ImpactStyle.Medium);
        }
        lastTapRef.current = 0; // Reset to prevent triple-tap
      } else {
        lastTapRef.current = now;
      }
    }
  }, [containerRef, gestureState.zoom, triggerHaptic]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const touches = Array.from(e.touches).map(t => getTouchData(t as any));

    if (touches.length === 2 && touchStartRef.current.length === 2) {
      // Pinch zoom
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / initialPinchDistanceRef.current;
      const newZoom = Math.max(0.5, Math.min(5, initialZoomRef.current * scale));
      
      setGestureState(prev => ({
        ...prev,
        zoom: newZoom,
      }));
    } else if (touches.length === 1 && touchStartRef.current.length === 1) {
      // Swipe to pan
      const deltaX = touches[0].x - swipeStartRef.current;
      const sensitivity = 0.5;
      
      setGestureState(prev => {
        const maxPan = (prev.zoom - 1) * 100;
        const newPan = Math.max(-maxPan, Math.min(maxPan, prev.pan + deltaX * sensitivity));
        return {
          ...prev,
          pan: newPan,
        };
      });
      
      swipeStartRef.current = touches[0].x;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length === 0) {
      touchStartRef.current = [];
    }
  }, []);

  const addMarker = useCallback((position: number) => {
    setGestureState(prev => ({
      ...prev,
      markers: [...prev.markers, position].sort((a, b) => a - b),
    }));
    triggerHaptic(ImpactStyle.Light);
  }, [triggerHaptic]);

  const removeMarker = useCallback((index: number) => {
    setGestureState(prev => ({
      ...prev,
      markers: prev.markers.filter((_, i) => i !== index),
    }));
    triggerHaptic(ImpactStyle.Light);
  }, [triggerHaptic]);

  const resetZoom = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      zoom: 1,
      pan: 0,
    }));
    triggerHaptic(ImpactStyle.Medium);
  }, [triggerHaptic]);

  const clearMarkers = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      markers: [],
    }));
    triggerHaptic(ImpactStyle.Medium);
  }, [triggerHaptic]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart as any, { passive: false });
    element.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    element.addEventListener('touchend', handleTouchEnd as any, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as any);
      element.removeEventListener('touchmove', handleTouchMove as any);
      element.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    zoom: gestureState.zoom,
    pan: gestureState.pan,
    markers: gestureState.markers,
    addMarker,
    removeMarker,
    resetZoom,
    clearMarkers,
  };
};

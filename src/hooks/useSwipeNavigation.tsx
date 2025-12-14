import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  edgeThreshold?: number;
  enabled?: boolean;
}

export const useSwipeNavigation = (config: SwipeConfig = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    edgeThreshold = 30,
    enabled = true,
  } = config;

  const navigate = useNavigate();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isEdgeSwipeRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      const isEdge = touch.clientX < edgeThreshold;
      isEdgeSwipeRef.current = isEdge;

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [enabled, edgeThreshold]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;

      // Calculate velocity for swipe detection
      const velocityX = Math.abs(deltaX) / elapsed;
      const velocityY = Math.abs(deltaY) / elapsed;

      // Determine primary direction
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontal && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          // Swipe right (back navigation on edge swipe)
          if (isEdgeSwipeRef.current) {
            navigate(-1);
          } else {
            onSwipeRight?.();
          }
        } else {
          onSwipeLeft?.();
        }
      } else if (!isHorizontal && Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      touchStartRef.current = null;
    },
    [enabled, threshold, navigate, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);

  return {
    isSupported: 'ontouchstart' in window,
  };
};

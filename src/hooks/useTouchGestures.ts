import { useEffect, useRef, useState } from 'react';

interface TouchGestureConfig {
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onLongPress?: () => void;
  longPressDuration?: number;
}

export const useTouchGestures = (config: TouchGestureConfig) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const initialDistance = useRef<number>(0);
  const initialAngle = useRef<number>(0);

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });

        // Long press
        if (config.onLongPress) {
          longPressTimer.current = setTimeout(() => {
            config.onLongPress?.();
          }, config.longPressDuration || 500);
        }
      } else if (e.touches.length === 2) {
        // Pinch/rotate gestures
        initialDistance.current = getDistance(e.touches[0], e.touches[1]);
        initialAngle.current = getAngle(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      if (e.touches.length === 2) {
        // Pinch
        if (config.onPinch) {
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          const scale = currentDistance / initialDistance.current;
          config.onPinch(scale);
        }

        // Rotate
        if (config.onRotate) {
          const currentAngle = getAngle(e.touches[0], e.touches[1]);
          const angleDiff = currentAngle - initialAngle.current;
          config.onRotate(angleDiff);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      if (e.changedTouches.length === 1 && touchStart) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStart.x;
        const dy = touch.clientY - touchStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const time = Date.now() - touchStart.time;

        // Swipe detection
        if (distance > 50 && time < 300 && config.onSwipe) {
          if (Math.abs(dx) > Math.abs(dy)) {
            config.onSwipe(dx > 0 ? 'right' : 'left');
          } else {
            config.onSwipe(dy > 0 ? 'down' : 'up');
          }
        }
      }

      setTouchStart(null);
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, [config, touchStart]);

  return elementRef;
};

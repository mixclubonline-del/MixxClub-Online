import { useEffect, useRef, useState } from "react";

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchZoom?: (scale: number) => void;
  onDoubleTap?: () => void;
  className?: string;
}

export const TouchGestures = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onPinchZoom,
  onDoubleTap,
  className
}: TouchGesturesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [initialDistance, setInitialDistance] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        
        // Double tap detection
        const now = Date.now();
        if (now - lastTap < 300 && onDoubleTap) {
          onDoubleTap();
        }
        setLastTap(now);
      } else if (e.touches.length === 2 && onPinchZoom) {
        // Pinch zoom start
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        setInitialDistance(Math.sqrt(dx * dx + dy * dy));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && onPinchZoom && initialDistance > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = distance / initialDistance;
        onPinchZoom(scale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && touchStart) {
        const touchEnd = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY
        };

        const deltaX = touchEnd.x - touchStart.x;
        const deltaY = touchEnd.y - touchStart.y;

        // Swipe detection (horizontal swipes only if |deltaX| > |deltaY|)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }

        setTouchStart(null);
      }
      setInitialDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, lastTap, initialDistance, onSwipeLeft, onSwipeRight, onPinchZoom, onDoubleTap]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

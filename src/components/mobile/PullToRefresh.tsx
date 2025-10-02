import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (refreshing || startY.current === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setPulling(true);
        setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= PULL_THRESHOLD && !refreshing) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
      setPulling(false);
      setPullDistance(0);
      startY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = pullProgress * 360;

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      {/* Pull indicator */}
      {(pulling || refreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 transition-all duration-300"
          style={{ 
            height: Math.max(pullDistance, 60),
            opacity: pullProgress 
          }}
        >
          <div 
            className={`bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg ${
              refreshing ? 'animate-spin' : ''
            }`}
            style={{ 
              transform: refreshing ? '' : `rotate(${rotation}deg)`,
              transition: refreshing ? '' : 'transform 0.1s'
            }}
          >
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: pulling ? `translateY(${pullDistance}px)` : '',
          transition: pulling ? 'none' : 'transform 0.3s'
        }}
      >
        {children}
      </div>
    </div>
  );
};

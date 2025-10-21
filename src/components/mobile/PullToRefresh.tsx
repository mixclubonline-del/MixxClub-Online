import { useState, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { trigger, heavy } = useHaptics();

  const handleDragStart = () => {
    if (disabled || isRefreshing) return;
    
    // Only start if scrolled to top
    if (containerRef.current?.scrollTop === 0) {
      setIsPulling(true);
    }
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (!isPulling || disabled || isRefreshing) return;

    const distance = Math.max(0, info.offset.y);
    setPullDistance(distance);

    // Haptic feedback at threshold
    if (distance >= threshold && pullDistance < threshold) {
      trigger('medium');
    }
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (!isPulling || disabled || isRefreshing) return;

    setIsPulling(false);
    
    if (info.offset.y >= threshold) {
      setIsRefreshing(true);
      heavy();
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        controls.start({ y: 0 });
      }
    } else {
      setPullDistance(0);
      controls.start({ y: 0 });
    }
  };

  const refreshIconRotation = isRefreshing 
    ? 360 
    : Math.min((pullDistance / threshold) * 180, 180);

  return (
    <div ref={containerRef} className="relative overflow-auto h-full">
      <motion.div
        drag={!disabled && !isRefreshing ? "y" : false}
        dragConstraints={{ top: 0, bottom: threshold * 2 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="min-h-full"
      >
        {/* Pull indicator */}
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center"
          style={{
            height: pullDistance,
            opacity: Math.min(pullDistance / threshold, 1),
          }}
        >
          <motion.div
            animate={{ rotate: refreshIconRotation }}
            transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0 }}
          >
            <RefreshCw 
              className="text-primary" 
              size={24}
            />
          </motion.div>
        </motion.div>

        {children}
      </motion.div>
    </div>
  );
};

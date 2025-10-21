import { useState, useRef, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className
}: SwipeableCardProps) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const haptics = useHaptics();

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Limit swipe distance
    const maxSwipe = 100;
    const limitedOffset = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    setOffset(limitedOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 50;

    if (offset > threshold && onSwipeRight) {
      haptics.success();
      onSwipeRight();
    } else if (offset < -threshold && onSwipeLeft) {
      haptics.warning();
      onSwipeLeft();
    }

    setOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left action background */}
      {rightAction && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 bg-success/20">
          {rightAction}
        </div>
      )}
      
      {/* Right action background */}
      {leftAction && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 bg-destructive/20">
          {leftAction}
        </div>
      )}

      {/* Swipeable card */}
      <Card
        className={cn(
          'transition-transform touch-pan-y',
          isDragging ? 'duration-0' : 'duration-300',
          className
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </Card>
    </div>
  );
};

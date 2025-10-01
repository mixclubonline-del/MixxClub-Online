import { ReactNode, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileDashboardCardProps {
  children: ReactNode;
  className?: string;
  swipeable?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const MobileDashboardCard = ({
  children,
  className,
  swipeable = false,
  onSwipeLeft,
  onSwipeRight,
}: MobileDashboardCardProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (!swipeable) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!swipeable) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!swipeable || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <Card
      className={cn('transition-transform touch-pan-y', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </Card>
  );
};

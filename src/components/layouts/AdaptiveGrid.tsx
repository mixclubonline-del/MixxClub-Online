import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceContext } from '@/hooks/useDeviceContext';

type GapSize = 'compact' | 'comfortable' | 'spacious';

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  /** Minimum width for each item in pixels */
  minItemWidth?: number;
  /** Maximum number of columns */
  maxColumns?: number;
  /** Gap size between items */
  gap?: GapSize;
  /** Center items when they don't fill the row */
  centerItems?: boolean;
}

const gapClasses: Record<GapSize, string> = {
  compact: 'gap-2 sm:gap-3',
  comfortable: 'gap-4 sm:gap-5 lg:gap-6',
  spacious: 'gap-6 sm:gap-8 lg:gap-10',
};

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  className,
  minItemWidth = 280,
  maxColumns = 6,
  gap = 'comfortable',
  centerItems = false,
}) => {
  const { breakpoint, isUltrawide } = useDeviceContext();

  // Calculate recommended columns based on breakpoint
  const getGridColumns = () => {
    switch (breakpoint) {
      case 'phone':
        return Math.min(maxColumns, 1);
      case 'tablet':
        return Math.min(maxColumns, 2);
      case 'laptop':
        return Math.min(maxColumns, 3);
      case 'desktop':
        return Math.min(maxColumns, 4);
      case 'ultrawide':
        return Math.min(maxColumns, 6);
      default:
        return Math.min(maxColumns, 4);
    }
  };

  return (
    <div
      className={cn(
        'grid w-full',
        gapClasses[gap],
        centerItems && 'justify-center',
        // Ultrawide: add horizontal padding for breathing room
        isUltrawide && 'px-4',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${minItemWidth}px, 100%), 1fr))`,
        maxWidth: isUltrawide ? '100%' : undefined,
      }}
    >
      {children}
    </div>
  );
};

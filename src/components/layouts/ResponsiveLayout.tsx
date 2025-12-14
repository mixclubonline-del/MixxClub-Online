import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideBottomNav?: boolean;
  fullHeight?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  hideBottomNav = false,
  fullHeight = false,
}) => {
  const { isPhone, isTablet, isDesktop } = useBreakpoint();

  return (
    <div
      className={cn(
        'w-full',
        // Safe area insets for notches and home indicators
        'pb-safe-area-inset-bottom pt-safe-area-inset-top',
        // Bottom padding for mobile nav (nav rendered globally in App.tsx)
        isPhone && !hideBottomNav && 'pb-20',
        // Height handling
        fullHeight ? 'min-h-screen' : 'min-h-0',
        // Device-specific padding
        isPhone && 'px-4',
        isTablet && 'px-6',
        isDesktop && 'px-8',
        className
      )}
    >
      {children}
    </div>
  );
};

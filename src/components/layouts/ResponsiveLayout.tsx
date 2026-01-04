import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/hooks/useAuth';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Hide bottom navigation padding */
  hideBottomNav?: boolean;
  /** Use full viewport height */
  fullHeight?: boolean;
  /** Has a fixed header at top */
  hasHeader?: boolean;
  /** Disable all safe area padding */
  noPadding?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  hideBottomNav = false,
  fullHeight = false,
  hasHeader = false,
  noPadding = false,
}) => {
  const { isPhone, isTablet, isDesktop } = useBreakpoint();
  const { user } = useAuth();

  // Bottom nav only shows for authenticated phone users
  const showsBottomNav = isPhone && user && !hideBottomNav;
  // Tablet sidebar only shows for authenticated tablet users
  const showsTabletSidebar = isTablet && user;

  if (noPadding) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'w-full',
        // Top padding for fixed header (GlobalHeader is h-16)
        hasHeader && 'pt-16',
        // Bottom padding for mobile nav (h-16 + safe area)
        showsBottomNav && 'pb-20',
        // Left padding for tablet sidebar (w-56 expanded or w-16 collapsed)
        showsTabletSidebar && 'md:pl-16 lg:pl-0',
        // Height handling
        fullHeight ? 'min-h-screen' : 'min-h-0',
        // Device-specific horizontal padding
        isPhone && 'px-4',
        isTablet && 'px-6',
        isDesktop && 'px-0',
        className
      )}
    >
      {children}
    </div>
  );
};

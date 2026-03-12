import { ReactNode, useMemo } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { RealTimeNotifications } from '@/components/RealTimeNotifications';
import { WalletIndicator } from '@/components/economy/WalletIndicator';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { MobileProNav } from '@/components/mobile/MobileProNav';
import { MobileFanNav } from '@/components/mobile/MobileFanNav';
import { TabletLayout } from './TabletLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMobileSwipeNav } from '@/hooks/useMobileSwipeNav';
import { ROUTES } from '@/config/routes';

interface AppLayoutProps {
  children: ReactNode;
}

// Swipeable tab orders (non-center tabs only, left→right)
const PRO_TABS_ARTIST = [
  ROUTES.MOBILE_PRO,
  ROUTES.ENGINEERS,
  `${ROUTES.ARTIST_CRM}?tab=messages`,
  `${ROUTES.ARTIST_CRM}?tab=earnings`,
];
const PRO_TABS_ENGINEER = [
  ROUTES.MOBILE_PRO,
  ROUTES.SESSIONS,
  `${ROUTES.ENGINEER_CRM}?tab=messages`,
  `${ROUTES.ENGINEER_CRM}?tab=earnings`,
];
const PRO_TABS_PRODUCER = [
  ROUTES.MOBILE_PRO,
  ROUTES.BEATS,
  `${ROUTES.PRODUCER_CRM}?tab=messages`,
  `${ROUTES.PRODUCER_CRM}?tab=earnings`,
];
const FAN_TABS = [
  ROUTES.MOBILE_FAN,
  ROUTES.LIVE,
  ROUTES.COMMUNITY,
  ROUTES.MARKETPLACE,
  ROUTES.FAN_HUB,
];

function getSwipeTabs(role: string | null, isFan: boolean): string[] {
  if (isFan) return FAN_TABS;
  if (role === 'engineer') return PRO_TABS_ENGINEER;
  if (role === 'producer') return PRO_TABS_PRODUCER;
  return PRO_TABS_ARTIST;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, activeRole } = useAuth();
  const isMobile = useIsMobile();
  const { deviceType } = useMobileDetect();
  const location = useLocation();

  const isFan = activeRole === 'fan';
  const swipeTabs = useMemo(
    () => getSwipeTabs(activeRole, isFan),
    [activeRole, isFan]
  );

  const { onTouchStart, onTouchEnd } = useMobileSwipeNav({ tabPaths: swipeTabs });

  // Determine swipe direction for slide animation
  const swipeDirection = useMemo(() => {
    const currentBase = location.pathname;
    const idx = swipeTabs.findIndex(
      (p) => currentBase === p.split('?')[0] || currentBase.startsWith(p.split('?')[0] + '/')
    );
    return idx;
  }, [location.pathname, swipeTabs]);

  // On phone, use role-split mobile navigation with swipe
  if (deviceType === 'phone') {
    return (
      <>
        {isFan ? <MobileFanNav /> : <MobileProNav />}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="min-h-screen"
        >
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pb-20"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </>
    );
  }

  // On tablet, use tablet-optimized layout
  if (deviceType === 'tablet') {
    return <TabletLayout>{children}</TabletLayout>;
  }

  // On desktop, use full sidebar layout
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-accent/10" />
              <div className="flex-1" />
              {user && <WalletIndicator variant="compact" />}
              {user && <RealTimeNotifications userId={user.id} />}
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

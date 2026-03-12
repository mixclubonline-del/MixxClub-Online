/**
 * MobileProNav — Business-focused bottom navigation
 * 
 * For Artists, Engineers, Producers.
 * 5 tabs with elevated center "Create" action.
 */

import { Home, Briefcase, MessageCircle, DollarSign, Plus, Mic2, Upload, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { ROUTES } from '@/config/routes';

interface NavTab {
  icon: typeof Home;
  label: string;
  path: string;
  badge?: number;
  isCenter?: boolean;
}

export const MobileProNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeRole } = useAuth();
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  const role = activeRole || 'artist';

  const getNavTabs = (): NavTab[] => {
    if (role === 'engineer') {
      return [
        { icon: Home, label: 'Home', path: ROUTES.MOBILE_PRO },
        { icon: Search, label: 'Jobs', path: ROUTES.SESSIONS },
        { icon: Mic2, label: 'Studio', path: ROUTES.HYBRID_DAW, isCenter: true },
        { icon: MessageCircle, label: 'Messages', path: `${ROUTES.ENGINEER_CRM}?tab=messages` },
        { icon: DollarSign, label: 'Earnings', path: `${ROUTES.ENGINEER_CRM}?tab=earnings` },
      ];
    }
    if (role === 'producer') {
      return [
        { icon: Home, label: 'Home', path: ROUTES.MOBILE_PRO },
        { icon: Briefcase, label: 'Beats', path: ROUTES.BEATS },
        { icon: Upload, label: 'Upload', path: ROUTES.PRIME_BEAT_FORGE, isCenter: true },
        { icon: MessageCircle, label: 'Messages', path: `${ROUTES.PRODUCER_CRM}?tab=messages` },
        { icon: DollarSign, label: 'Earnings', path: `${ROUTES.PRODUCER_CRM}?tab=earnings` },
      ];
    }
    // Artist default
    return [
      { icon: Home, label: 'Home', path: ROUTES.MOBILE_PRO },
      { icon: Search, label: 'Engineers', path: ROUTES.ENGINEERS },
      { icon: Plus, label: 'Create', path: ROUTES.CREATE_SESSION, isCenter: true },
      { icon: MessageCircle, label: 'Messages', path: `${ROUTES.ARTIST_CRM}?tab=messages` },
      { icon: DollarSign, label: 'Earnings', path: `${ROUTES.ARTIST_CRM}?tab=earnings` },
    ];
  };

  const tabs = getNavTabs();

  const handleTabPress = useCallback((path: string, isCenter = false) => {
    triggerHaptic(isCenter ? 'heavy' : 'light');
    navigate(path);
  }, [navigate, triggerHaptic]);

  if (!user || location.pathname.startsWith('/auth')) return null;

  const excludedPaths = ['/insider-demo', '/hybrid-daw', '/city-gates'];
  if (excludedPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 touch-manipulation" aria-label="Pro navigation">
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      <div className="bg-card/98 backdrop-blur-xl border-t border-border/30 pb-safe">
        <div className="flex justify-around items-end h-[68px] px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path ||
              (tab.path !== '/' && location.pathname.startsWith(tab.path.split('?')[0]));
            const isPressed = pressedTab === tab.path;

            if (tab.isCenter) {
              return (
                <motion.button
                  key={tab.label}
                  onClick={() => handleTabPress(tab.path, true)}
                  onTouchStart={() => setPressedTab(tab.path)}
                  onTouchEnd={() => setPressedTab(null)}
                  onTouchCancel={() => setPressedTab(null)}
                  whileTap={{ scale: 0.92 }}
                  className="relative flex flex-col items-center justify-center -mt-4"
                >
                  <motion.div
                    animate={{ scale: isPressed ? 0.95 : 1, y: isPressed ? 2 : 0 }}
                    transition={{ duration: 0.1 }}
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br from-primary via-primary to-accent",
                      "shadow-lg shadow-primary/30",
                      "border border-primary/40"
                    )}
                  >
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  <span className="text-[10px] font-semibold mt-1 text-primary">{tab.label}</span>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={tab.label}
                onClick={() => handleTabPress(tab.path)}
                onTouchStart={() => setPressedTab(tab.path)}
                onTouchEnd={() => setPressedTab(null)}
                onTouchCancel={() => setPressedTab(null)}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-2 gap-0.5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <motion.div
                  animate={{
                    scale: isPressed ? 0.9 : 1,
                    backgroundColor: isActive ? 'hsl(var(--primary) / 0.15)' : 'transparent',
                  }}
                  transition={{ duration: 0.1 }}
                  className={cn("relative p-2.5 rounded-xl", isActive && "bg-primary/15")}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={cn(
                  "text-[10px] transition-all duration-150",
                  isActive ? "font-semibold" : "font-medium opacity-80"
                )}>
                  {tab.label}
                </span>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="proActiveTab"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

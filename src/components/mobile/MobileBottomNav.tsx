import { Home, Briefcase, Users, Plus, Search, Bell, Mic2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { useNotifications } from '@/hooks/useNotifications';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface NavTab {
  icon: typeof Home;
  label: string;
  path: string;
  badge?: number;
  isCenter?: boolean;
}

export const MobileBottomNav = () => {
  const { navigateTo } = useFlowNavigation();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { unreadCount } = useNotifications();
  const { trigger, medium, heavy } = useHaptics();
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  // Core navigation tabs based on role - 5 tabs max for thumb reach
  const getNavTabs = (): NavTab[] => {
    const notificationTab: NavTab = { 
      icon: Bell, 
      label: 'Alerts', 
      path: '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined 
    };

    if (userRole === 'engineer') {
      return [
        { icon: Home, label: 'Home', path: '/engineer-crm' },
        { icon: Search, label: 'Find', path: '/sessions' },
        { icon: Mic2, label: 'Record', path: '/hybrid-daw', isCenter: true },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        notificationTab,
      ];
    }

    if (userRole === 'admin') {
      return [
        { icon: Home, label: 'Home', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Plus, label: 'New', path: '/create-session', isCenter: true },
        { icon: Briefcase, label: 'Sessions', path: '/admin/sessions' },
        notificationTab,
      ];
    }

    // Default: Artist - optimized for creation flow
    return [
      { icon: Home, label: 'Home', path: '/artist-crm' },
      { icon: Search, label: 'Find', path: '/engineers' },
      { icon: Plus, label: 'Create', path: '/create-session', isCenter: true },
      { icon: Users, label: 'Sessions', path: '/sessions' },
      notificationTab,
    ];
  };

  const tabs = getNavTabs();

  // Don't show on auth pages or when not logged in
  if (!user || location.pathname.startsWith('/auth')) return null;

  // Don't show on immersive experiences
  const excludedPaths = ['/insider-demo', '/mixxclub-demo', '/city-gates', '/hybrid-daw'];
  if (excludedPaths.some(path => location.pathname.startsWith(path))) return null;

  const handleTabPress = useCallback((path: string, isCenter: boolean = false) => {
    // Stronger haptic for center action button
    if (isCenter) {
      heavy();
    } else {
      medium();
    }
    navigateTo(path);
  }, [navigateTo, medium, heavy]);

  const handleTouchStart = useCallback((path: string) => {
    setPressedTab(path);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPressedTab(null);
  }, []);

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 touch-feedback no-select-swipe" 
      aria-label="Mobile navigation"
    >
      {/* Gradient fade above nav for content visibility */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      
      <div className="bg-card/98 backdrop-blur-xl border-t border-border/30 pb-safe">
        <div className="flex justify-around items-end h-[68px] px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path || 
              (tab.path !== '/' && location.pathname.startsWith(tab.path));
            const isPressed = pressedTab === tab.path;
            
            // Center action button (elevated, larger)
            if (tab.isCenter) {
              return (
                <motion.button
                  key={tab.path}
                  onClick={() => handleTabPress(tab.path, true)}
                  onTouchStart={() => handleTouchStart(tab.path)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "relative flex flex-col items-center justify-center -mt-4",
                    "touch-target-xl"
                  )}
                >
                  <motion.div
                    animate={{ 
                      scale: isPressed ? 0.95 : 1,
                      y: isPressed ? 2 : 0 
                    }}
                    transition={{ duration: 0.1 }}
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br from-primary via-primary to-accent-blue",
                      "shadow-lg shadow-primary/30",
                      "border border-white/20"
                    )}
                  >
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  <span className="text-[10px] font-semibold mt-1 text-primary">
                    {tab.label}
                  </span>
                </motion.button>
              );
            }
            
            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabPress(tab.path)}
                onTouchStart={() => handleTouchStart(tab.path)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-2 gap-0.5",
                  "touch-target",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <motion.div 
                  animate={{ 
                    scale: isPressed ? 0.9 : 1,
                    backgroundColor: isActive ? 'hsl(var(--primary) / 0.15)' : 'transparent'
                  }}
                  transition={{ duration: 0.1 }}
                  className={cn(
                    "relative p-2.5 rounded-xl",
                    isActive && "bg-primary/15"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Notification badge - optimized positioning */}
                  <AnimatePresence>
                    {'badge' in tab && tab.badge && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={cn(
                          "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]",
                          "bg-destructive text-destructive-foreground",
                          "text-[10px] font-bold rounded-full",
                          "flex items-center justify-center px-1",
                          "border-2 border-card"
                        )}
                      >
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                <span className={cn(
                  "text-[10px] transition-all duration-150",
                  isActive ? "font-semibold" : "font-medium opacity-80"
                )}>
                  {tab.label}
                </span>
                
                {/* Active indicator - smooth spring animation */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
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

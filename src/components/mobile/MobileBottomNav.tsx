import { Home, Briefcase, Users, Plus, Trophy, Search, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { unreadCount } = useNotifications();
  const { triggerHaptic } = useHapticFeedback();

  // Core navigation tabs based on role
  const getNavTabs = () => {
    const notificationTab = { 
      icon: Bell, 
      label: 'Alerts', 
      path: '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined 
    };

    if (userRole === 'engineer') {
      return [
        { icon: Home, label: 'Home', path: '/engineer-crm' },
        { icon: Search, label: 'Sessions', path: '/sessions' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        notificationTab,
      ];
    }

    if (userRole === 'admin') {
      return [
        { icon: Home, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Briefcase, label: 'Sessions', path: '/admin/sessions' },
        notificationTab,
      ];
    }

    // Default: Artist
    return [
      { icon: Home, label: 'Home', path: '/artist-crm' },
      { icon: Plus, label: 'Create', path: '/create-session' },
      { icon: Users, label: 'Engineers', path: '/engineers' },
      notificationTab,
    ];
  };

  const tabs = getNavTabs();

  // Don't show on auth pages or when not logged in
  if (!user || location.pathname.startsWith('/auth')) return null;

  // Don't show on pages with their own nav
  const excludedPaths = ['/insider-demo', '/mixxclub-demo', '/city-gates'];
  if (excludedPaths.some(path => location.pathname.startsWith(path))) return null;

  const handleTabPress = (path: string) => {
    triggerHaptic('selection');
    navigate(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-background/95 backdrop-blur-xl border-t border-border/50">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path || 
              (tab.path !== '/' && location.pathname.startsWith(tab.path));
            
            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabPress(tab.path)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200",
                  "min-h-[44px] min-w-[44px]", // Touch target accessibility
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <div className={cn(
                  "relative p-2 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/15"
                )}>
                  <Icon className="h-5 w-5" />
                  
                  {/* Notification badge */}
                  <AnimatePresence>
                    {'badge' in tab && tab.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                      >
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive && "font-semibold"
                )}>
                  {tab.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

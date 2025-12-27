import { Home, Briefcase, Users, Plus, Trophy, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();

  // Core navigation tabs based on role
  const getNavTabs = () => {
    if (userRole === 'engineer') {
      return [
        { icon: Home, label: 'Home', path: '/engineer-crm' },
        { icon: Search, label: 'Sessions', path: '/sessions' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Trophy, label: 'Progress', path: '/achievements' },
      ];
    }

    if (userRole === 'admin') {
      return [
        { icon: Home, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Briefcase, label: 'Sessions', path: '/admin/sessions' },
        { icon: Trophy, label: 'Analytics', path: '/admin/analytics' },
      ];
    }

    // Default: Artist
    return [
      { icon: Home, label: 'Home', path: '/artist-crm' },
      { icon: Plus, label: 'Create', path: '/create-session' },
      { icon: Users, label: 'Engineers', path: '/engineers' },
      { icon: Trophy, label: 'Progress', path: '/achievements' },
    ];
  };

  const tabs = getNavTabs();

  // Don't show on auth pages or when not logged in
  if (!user || location.pathname.startsWith('/auth')) return null;

  // Don't show on pages with their own nav
  const excludedPaths = ['/insider-demo', '/mixxclub-demo', '/city-gates'];
  if (excludedPaths.some(path => location.pathname.startsWith(path))) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 z-50">
      <div className="flex justify-around items-center h-16 px-2 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || 
            (tab.path !== '/' && location.pathname.startsWith(tab.path));
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200",
                isActive 
                  ? "text-primary scale-105" 
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

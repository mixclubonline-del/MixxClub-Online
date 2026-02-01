import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { cn } from '@/lib/utils';
import {
  Home,
  Briefcase,
  Users,
  Plus,
  Trophy,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Music,
  LayoutDashboard,
  Mic2,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletIndicator } from '@/components/economy/WalletIndicator';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export const TabletSideNav: React.FC = () => {
  const { navigateTo } = useFlowNavigation();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavItems = (): NavItem[] => {
    if (userRole === 'engineer') {
      return [
        { icon: Home, label: 'Dashboard', path: '/engineer-crm' },
        { icon: Search, label: 'Sessions', path: '/sessions' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Coins, label: 'Coinz', path: '/economy' },
        { icon: Trophy, label: 'Progress', path: '/achievements' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    }

    if (userRole === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Briefcase, label: 'Sessions', path: '/admin/sessions' },
        { icon: Trophy, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    }

    // Default: Artist
    return [
      { icon: Home, label: 'Dashboard', path: '/artist-crm' },
      { icon: Plus, label: 'Create', path: '/create-session' },
      { icon: Users, label: 'Engineers', path: '/engineers' },
      { icon: Coins, label: 'Coinz', path: '/economy' },
      { icon: Music, label: 'Sessions', path: '/sessions' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ];
  };

  const navItems = getNavItems();

  // Don't show on auth pages or when not logged in
  if (!user || location.pathname.startsWith('/auth')) return null;

  // Don't show on specific pages
  const excludedPaths = ['/insider-demo', '/mixxclub-demo', '/city-gates'];
  if (excludedPaths.some(path => location.pathname.startsWith(path))) return null;

  return (
    <aside
      className={cn(
        'hidden md:flex lg:hidden flex-col h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 fixed left-0 top-0 z-40 transition-all duration-300 shadow-xl',
        isCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo area */}
      <div className="h-14 flex items-center justify-between border-b border-border/50 px-4">
        {!isCollapsed ? (
          <>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MixClub
            </span>
            <WalletIndicator variant="mini" />
          </>
        ) : (
          <Mic2 className="h-6 w-6 text-primary mx-auto" />
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <li key={item.path}>
                <button
                  onClick={() => navigateTo(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
};

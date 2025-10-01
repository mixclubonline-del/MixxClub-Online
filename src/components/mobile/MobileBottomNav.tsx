import { Home, Briefcase, DollarSign, User, Plus, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine user role from current path
  const isEngineer = location.pathname.includes('engineer');
  const isArtist = location.pathname.includes('artist');
  const isAdmin = location.pathname.includes('mobile-admin');

  const engineerTabs = [
    { icon: Home, label: 'Home', path: '/engineer-crm' },
    { icon: Briefcase, label: 'Jobs', path: '/job-board' },
    { icon: DollarSign, label: 'Earnings', path: '/engineer-dashboard' },
    { icon: User, label: 'Profile', path: '/engineer-profile' },
  ];

  const artistTabs = [
    { icon: Home, label: 'Home', path: '/artist-crm' },
    { icon: Plus, label: 'Post Job', path: '/job-board' },
    { icon: Briefcase, label: 'Projects', path: '/artist-dashboard' },
    { icon: User, label: 'Profile', path: '/artist-crm' },
  ];

  const adminTabs = [
    { icon: Home, label: 'Dashboard', path: '/mobile-admin' },
    { icon: User, label: 'Users', path: '/mobile-admin/users' },
    { icon: DollarSign, label: 'Payouts', path: '/mobile-admin/payouts' },
    { icon: Shield, label: 'Admin', path: '/admin' },
  ];

  const tabs = isAdmin ? adminTabs : isEngineer ? engineerTabs : artistTabs;

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

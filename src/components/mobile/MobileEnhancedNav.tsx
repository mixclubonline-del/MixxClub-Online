import { Home, Briefcase, DollarSign, User, Plus, Bot, Bell, Menu, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletIndicator } from '@/components/economy/WalletIndicator';
import { ROUTES } from '@/config/routes';

interface NavTab {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

export const MobileEnhancedNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });
  const [notificationCount] = useState(3);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Use auth-based role detection instead of URL sniffing
  const getTabsForRole = (): NavTab[] => {
    switch (userRole) {
      case 'engineer':
        return [
          { icon: Home, label: 'Home', path: ROUTES.ENGINEER_CRM },
          { icon: Briefcase, label: 'Jobs', path: ROUTES.JOBS, badge: 5 },
          { icon: ShoppingBag, label: 'Shop', path: ROUTES.MERCH },
          { icon: Bot, label: 'AI', path: ROUTES.MOBILE_MIXXBOT },
          { icon: User, label: 'Profile', path: ROUTES.SETTINGS },
        ];
      case 'producer':
        return [
          { icon: Home, label: 'Home', path: ROUTES.PRODUCER_CRM },
          { icon: Briefcase, label: 'Beats', path: ROUTES.BEATS },
          { icon: ShoppingBag, label: 'Shop', path: ROUTES.MERCH },
          { icon: Bot, label: 'AI', path: ROUTES.MOBILE_MIXXBOT },
          { icon: User, label: 'Profile', path: ROUTES.SETTINGS },
        ];
      case 'fan':
        return [
          { icon: Home, label: 'Feed', path: ROUTES.FAN_HUB },
          { icon: Briefcase, label: 'Discover', path: ROUTES.COMMUNITY },
          { icon: ShoppingBag, label: 'Shop', path: ROUTES.MERCH },
          { icon: Bot, label: 'AI', path: ROUTES.MOBILE_MIXXBOT },
          { icon: User, label: 'Profile', path: ROUTES.SETTINGS },
        ];
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: ROUTES.ADMIN },
          { icon: Bot, label: 'Mixx Bot', path: ROUTES.MOBILE_MIXXBOT },
          { icon: ShoppingBag, label: 'Shop', path: ROUTES.MERCH },
          { icon: User, label: 'Users', path: ROUTES.ADMIN },
        ];
      default: // artist
        return [
          { icon: Home, label: 'Home', path: ROUTES.ARTIST_CRM },
          { icon: Briefcase, label: 'Projects', path: ROUTES.ARTIST_CRM },
          { icon: ShoppingBag, label: 'Shop', path: ROUTES.MERCH },
          { icon: Bot, label: 'AI', path: ROUTES.MOBILE_MIXXBOT },
          { icon: User, label: 'Profile', path: ROUTES.SETTINGS },
        ];
    }
  };

  const tabs = getTabsForRole();

  const handleNavigation = (path: string) => {
    triggerHaptic('light');
    setSheetOpen(false);
    navigate(path);
  };

  if (!user) return null;

  return (
    <>
      {/* Top Header for Mobile */}
      <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/mixclub-3d-logo.png" 
              alt="Mixxclub" 
              className="h-8 w-8"
            />
            <span className="font-bold text-lg">Mixxclub</span>
          </div>
          <div className="flex items-center gap-2">
            <WalletIndicator variant="mini" />
            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
              onClick={() => handleNavigation(ROUTES.NOTIFICATIONS)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => handleNavigation(ROUTES.SETTINGS)}
                  >
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => handleNavigation(ROUTES.FAQ)}
                  >
                    Help & Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start text-destructive"
                    onClick={() => handleNavigation(ROUTES.AUTH)}
                  >
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <button
                key={tab.path}
                onClick={() => handleNavigation(tab.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200",
                  isActive 
                    ? "text-primary scale-105" 
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive && "drop-shadow-glow")} />
                  {tab.badge && tab.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                    >
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-bold"
                )}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

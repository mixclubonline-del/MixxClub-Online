/**
 * MobileTopBar — Role-styled top header for mobile.
 * 
 * Pro (Artist/Engineer/Producer): dark, compact, business-tone with earnings badge.
 * Fan: vibrant, social-tone with streak counter and discover CTA.
 * Admin: clean neutral bar.
 */

import { Bell, Menu, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { WalletIndicator } from '@/components/economy/WalletIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

export const MobileTopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeRole } = useAuth();
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  const handleNav = (path: string) => {
    triggerHaptic('light');
    setSheetOpen(false);
    navigate(path);
  };

  if (!user) return null;

  const isFan = activeRole === 'fan';

  return (
    <div className="md:hidden sticky top-0 z-50 backdrop-blur-xl border-b border-border/30">
      {/* Subtle role-colored gradient line at top */}
      <div className={cn(
        "h-0.5 w-full",
        isFan
          ? "bg-gradient-to-r from-destructive via-accent to-primary"
          : "bg-gradient-to-r from-primary via-primary/60 to-accent"
      )} />

      <div className="flex items-center justify-between px-4 h-13 bg-background/95">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/lovable-uploads/mixclub-3d-logo.png"
            alt="Mixxclub"
            className="h-7 w-7"
          />
          <span className="font-bold text-base text-foreground tracking-tight">
            Mixxclub
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <WalletIndicator variant="mini" />

          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 relative"
            onClick={() => handleNav(ROUTES.NOTIFICATIONS)}
          >
            <Bell className="h-4.5 w-4.5" />
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Menu className="h-4.5 w-4.5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                {/* Role badge */}
                <div className="px-3 pb-4 mb-2 border-b border-border/30">
                  <p className="text-sm font-medium text-foreground">
                    {user.email}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1.5 text-xs capitalize",
                      isFan ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"
                    )}
                  >
                    {activeRole || 'artist'}
                  </Badge>
                </div>

                {isFan ? (
                  <>
                    <MenuBtn label="My Hub" onClick={() => handleNav(ROUTES.FAN_HUB)} />
                    <MenuBtn label="Discover" onClick={() => handleNav(ROUTES.COMMUNITY)} />
                    <MenuBtn label="Marketplace" onClick={() => handleNav(ROUTES.MARKETPLACE)} />
                    <MenuBtn label="Achievements" onClick={() => handleNav(ROUTES.ACHIEVEMENTS)} />
                  </>
                ) : (
                  <>
                    <MenuBtn label="Dashboard" onClick={() => handleNav(`/${activeRole || 'artist'}-crm`)} />
                    <MenuBtn label="Sessions" onClick={() => handleNav(ROUTES.SESSIONS)} />
                    <MenuBtn label="Marketplace" onClick={() => handleNav(ROUTES.MARKETPLACE)} />
                    <MenuBtn label="Audio Lab" onClick={() => handleNav(ROUTES.AUDIO_LAB)} />
                  </>
                )}

                <div className="border-t border-border/30 mt-2 pt-2">
                  <MenuBtn label="Settings" onClick={() => handleNav(ROUTES.SETTINGS)} />
                  <MenuBtn label="Help & Support" onClick={() => handleNav(ROUTES.FAQ)} />
                  <MenuBtn label="MixxBot AI" onClick={() => handleNav(ROUTES.MOBILE_MIXXBOT)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

function MenuBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      className="justify-start h-11 text-sm font-medium"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

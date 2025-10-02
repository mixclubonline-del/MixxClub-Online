import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Smartphone, Zap, Bell, Download, X } from 'lucide-react';

const POPUP_STORAGE_KEY = 'mobile-app-popup-dismissed';
const POPUP_DELAY = 20000; // 20 seconds
const SCROLL_THRESHOLD = 0.4; // 40% scroll

export const MobileAppDownloadPopup = () => {
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  // Detect iOS vs Android
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const platform = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile';

  useEffect(() => {
    // Only show on mobile devices, when not authenticated
    if (!isMobile || user) return;

    // Check if popup was dismissed and is still valid (24 hours)
    const dismissedData = localStorage.getItem(POPUP_STORAGE_KEY);
    if (dismissedData) {
      const { timestamp } = JSON.parse(dismissedData);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (timestamp > oneDayAgo) return;
    }

    // Track scroll progress
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrolled / total;
      setScrollProgress(progress);

      if (progress >= SCROLL_THRESHOLD && !open) {
        setOpen(true);
        trackEvent({
          event: 'mobile_app_popup_shown',
          properties: { trigger: 'scroll', platform }
        });
      }
    };

    // Set timer for auto-show
    const timer = setTimeout(() => {
      if (scrollProgress < SCROLL_THRESHOLD) {
        setOpen(true);
        trackEvent({
          event: 'mobile_app_popup_shown',
          properties: { trigger: 'timer', platform }
        });
      }
    }, POPUP_DELAY);

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, user, open, scrollProgress, platform, trackEvent]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify({
      timestamp: Date.now(),
      dismissed: true
    }));
    trackEvent({
      event: 'mobile_app_popup_dismissed',
      properties: { platform }
    });
  };

  const handleTryMobile = () => {
    trackEvent({
      event: 'mobile_app_popup_clicked',
      properties: { action: 'try_mobile', platform }
    });
    navigate('/mobile-landing');
    setOpen(false);
  };

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="space-y-3 pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Smartphone className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Get the MixClub Mobile App
          </DialogTitle>
          
          <DialogDescription className="text-center text-base">
            Experience the future of music production on {platform}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Offline Mixing & Mastering</div>
                <div className="text-xs text-muted-foreground">Work on projects anywhere, anytime</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Instant Push Notifications</div>
                <div className="text-xs text-muted-foreground">Never miss project updates</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Native Audio Processing</div>
                <div className="text-xs text-muted-foreground">Faster performance than web</div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Join <span className="font-bold text-primary">2,500+ musicians</span> on mobile
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-2 pt-2">
            <Button 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              onClick={handleTryMobile}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Try Mobile Experience
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full"
              onClick={handleClose}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Smartphone, X } from 'lucide-react';

const POPUP_STORAGE_KEY = 'mobile-app-popup-dismissed';
const POPUP_DELAY_MS = 45000; // 45 seconds - much longer initial delay
const SCROLL_THRESHOLD = 0.6; // 60% scroll - deeper engagement
const DISMISS_DURATION_DAYS = 7; // Don't show again for 7 days

export const MobileAppDownloadPopup = () => {
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iOS' : 
                   /Android/i.test(navigator.userAgent) ? 'Android' : 'Mobile';

  useEffect(() => {
    // Only show on mobile, when not logged in
    if (!isMobile || user) return;

    // Check if dismissed recently
    const dismissedData = localStorage.getItem(POPUP_STORAGE_KEY);
    if (dismissedData) {
      const { timestamp } = JSON.parse(dismissedData);
      const daysSinceDismissal = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < DISMISS_DURATION_DAYS) return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? scrolled / total : 0;
      setScrollProgress(progress);

      if (progress >= SCROLL_THRESHOLD && !open) {
        setOpen(true);
        trackEvent('mobile_app_popup_shown', { trigger: 'scroll', platform });
      }
    };

    const timer = setTimeout(() => {
      if (scrollProgress < SCROLL_THRESHOLD && !open) {
        setOpen(true);
        trackEvent('mobile_app_popup_shown', { trigger: 'timer', platform });
      }
    }, POPUP_DELAY_MS);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, user, open, scrollProgress, platform, trackEvent]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
    trackEvent('mobile_app_popup_dismissed', { platform });
  };

  const handleTryMobile = () => {
    trackEvent('mobile_app_popup_clicked', { action: 'try_mobile', platform });
    navigate('/mobile-landing');
    setOpen(false);
  };

  if (!isMobile) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xs mx-4 rounded-xl p-4">
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="space-y-2 pt-1">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-base font-semibold text-center">
            Try the Mobile App
          </DialogTitle>
          <DialogDescription className="text-sm text-center">
            Faster performance & offline access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <Button 
            className="w-full h-9 text-sm"
            onClick={handleTryMobile}
          >
            Learn More
          </Button>
          <Button 
            variant="ghost"
            className="w-full h-8 text-xs"
            onClick={handleClose}
          >
            Not Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

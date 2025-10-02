import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Zap, Users, TrendingUp } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityMilestones } from "@/hooks/useCommunityMilestones";
import { useAnalytics } from "@/hooks/useAnalytics";

export const AppDownloadPopup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canInstall, promptInstall } = usePWAInstall();
  const { data: milestones } = useCommunityMilestones();
  const { trackEvent } = useAnalytics();
  
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calculate total community members
  const totalMembers = milestones?.reduce((sum, m) => sum + (m.contributor_count || 0), 0) || 1247;

  useEffect(() => {
    // Don't show if user is authenticated
    if (user) return;

    // Check if popup was dismissed in this session
    const dismissed = sessionStorage.getItem('app-download-popup-dismissed');
    if (dismissed) return;

    // Timer trigger - show after 30 seconds
    const timer = setTimeout(() => {
      setOpen(true);
      trackEvent({ event: 'app_download_popup_shown', properties: { trigger: 'timer' } });
    }, 30000);

    // Scroll trigger - show when user scrolls past 50%
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      
      if (scrollPercent > 50 && !open) {
        setOpen(true);
        trackEvent({ event: 'app_download_popup_shown', properties: { trigger: 'scroll' } });
        clearTimeout(timer);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [user, canInstall, open, trackEvent]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('app-download-popup-dismissed', 'true');
    trackEvent({ event: 'app_download_popup_dismissed' });
  };

  const handleInstallPWA = async () => {
    const installed = await promptInstall();
    if (installed) {
      trackEvent({ event: 'pwa_installed', properties: { source: 'popup' } });
      setOpen(false);
    }
  };

  const handleGetStarted = () => {
    trackEvent({ event: 'app_download_popup_cta_clicked', properties: { action: 'get_started' } });
    navigate('/auth');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <Smartphone className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Get the MixClub Experience
          </DialogTitle>
          <DialogDescription className="text-center">
            Join {totalMembers.toLocaleString()}+ musicians creating amazing music
          </DialogDescription>
        </DialogHeader>

        {/* Features */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Instant AI-powered mixing & mastering</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Connect with top audio engineers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Real-time collaboration studio</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2">
          {canInstall ? (
            <Button 
              onClick={handleInstallPWA} 
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          ) : (
            <Button 
              onClick={handleGetStarted} 
              className="w-full"
              size="lg"
            >
              Get Started Free
            </Button>
          )}
          <Button 
            onClick={handleClose} 
            variant="ghost" 
            className="w-full"
          >
            Not Now
          </Button>
        </div>

        {/* Social Proof */}
        <p className="text-center text-xs text-muted-foreground">
          {milestones && milestones.length > 0 && (
            <>
              {milestones[0].current_value} projects completed this month
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
};

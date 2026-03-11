import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useMobileDetect } from "@/hooks/useMobileDetect";

const DISMISS_KEY = 'pwa_install_dismissed_at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isDismissed = (): boolean => {
  try {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) return false;
    return Date.now() - parseInt(dismissedAt, 10) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
};

const persistDismiss = () => {
  try {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  } catch {}
};

export const PWAInstallPrompt = () => {
  const { canInstall, promptInstall, isInstalled } = usePWAInstall();
  const { isIOS, isPWA } = useMobileDetect();
  const [dismissed, setDismissed] = useState(() => isDismissed());

  // iOS doesn't fire beforeinstallprompt — show manual guidance instead
  const showIOSGuide = isIOS && !isPWA && !isInstalled && !dismissed;
  const showStandardPrompt = canInstall && !dismissed;

  if (!showIOSGuide && !showStandardPrompt) return null;

  const handleDismiss = () => {
    setDismissed(true);
    persistDismiss();
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      handleDismiss();
    }
  };

  return (
    <Card className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 shadow-lg border-primary/30 z-50 animate-fade-in bg-card">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-full shrink-0">
          {showIOSGuide ? (
            <Share className="h-6 w-6 text-primary" />
          ) : (
            <Download className="h-6 w-6 text-primary" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold mb-1 text-foreground">Install Mixxclub</h4>
          {showIOSGuide ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Tap <span className="inline-flex items-center gap-0.5 font-medium text-foreground"><Share className="h-3.5 w-3.5 inline" /> Share</span> then <span className="font-medium text-foreground">"Add to Home Screen"</span> for the full app experience
              </p>
              <Button onClick={handleDismiss} variant="outline" size="sm" className="w-full">
                Got it
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Get the full app experience with offline access and faster loading
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  Install App
                </Button>
                <Button 
                  onClick={handleDismiss} 
                  variant="outline" 
                  size="sm"
                >
                  Not Now
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_DELAY_MS = 5000; // 5 seconds - let user engage first
const DISMISS_DURATION_DAYS = 30; // Remember dismissal for 30 days

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    const dismissedAt = localStorage.getItem('cookieConsentDismissedAt');
    
    // Check if already consented
    if (consent) {
      setPreferences(JSON.parse(consent));
      return;
    }
    
    // Check if dismissed recently
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < DISMISS_DURATION_DAYS) return;
    }
    
    // Show after delay
    const timer = setTimeout(() => setShowBanner(true), COOKIE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    localStorage.removeItem('cookieConsentDismissedAt');
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({ necessary: true, analytics: true, marketing: true });
  };

  const acceptNecessary = () => {
    savePreferences({ necessary: true, analytics: false, marketing: false });
  };

  const dismiss = () => {
    localStorage.setItem('cookieConsentDismissedAt', Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Compact toast-style banner - highest z-index to never be overlapped */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[90] animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-3">
            <Cookie className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">
              We use cookies to improve your experience.
            </p>
            <div className="flex items-center gap-1">
              <Button onClick={acceptAll} size="sm" variant="default" className="h-7 px-2 text-xs">
                Accept
              </Button>
              <Button onClick={() => setShowSettings(true)} size="sm" variant="ghost" className="h-7 px-2">
                <Settings className="h-3 w-3" />
              </Button>
              <Button onClick={dismiss} size="sm" variant="ghost" className="h-7 w-7 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Settings</DialogTitle>
            <DialogDescription>
              Choose which cookies you'd like to accept.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between p-2 border rounded-lg bg-muted/50">
              <div className="flex-1">
                <Label className="text-sm font-medium">Necessary</Label>
                <p className="text-xs text-muted-foreground">Required for the site to work</p>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium">Analytics</Label>
                <p className="text-xs text-muted-foreground">Help us improve the site</p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium">Marketing</Label>
                <p className="text-xs text-muted-foreground">Personalized recommendations</p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => savePreferences(preferences)} size="sm" className="flex-1">
                Save
              </Button>
              <Button onClick={acceptNecessary} size="sm" variant="outline" className="flex-1">
                Necessary Only
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

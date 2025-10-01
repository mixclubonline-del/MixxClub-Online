import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const MobileNotificationBanner = () => {
  const { permission, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:hidden p-4 shadow-lg border-primary z-50 animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Stay Updated</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Get instant notifications about projects, payments, and achievements
          </p>
          <div className="flex gap-2">
            <Button onClick={requestPermission} size="sm" className="flex-1">
              Enable Notifications
            </Button>
            <Button 
              onClick={() => setDismissed(true)} 
              variant="outline" 
              size="sm"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

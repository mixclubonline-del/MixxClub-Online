import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);
  const { getPendingTasksCount, processPendingTasks } = useBackgroundSync();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updatePending = () => setPendingCount(getPendingTasksCount());
    updatePending();
    const interval = setInterval(updatePending, 5000);

    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      updatePending();
      setTimeout(() => {
        if (getPendingTasksCount() === 0) setShowAlert(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [getPendingTasksCount]);

  const handleSyncNow = async () => {
    if (syncing || !isOnline) return;
    setSyncing(true);
    try {
      await processPendingTasks();
      setPendingCount(getPendingTasksCount());
      if (getPendingTasksCount() === 0) {
        setTimeout(() => setShowAlert(false), 1500);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Show when offline OR when online with pending items
  if (!showAlert && !(isOnline && pendingCount > 0)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:top-16 md:bottom-auto z-[80] animate-slide-in-top">
      <Alert variant={isOnline ? 'default' : 'destructive'} className="bg-card border-border shadow-lg">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <WifiOff className="h-4 w-4 shrink-0" />
          )}
          <AlertDescription className="flex-1 text-sm">
            {isOnline
              ? pendingCount > 0
                ? `Back online · ${pendingCount} change${pendingCount !== 1 ? 's' : ''} pending`
                : 'Back online!'
              : pendingCount > 0
                ? `Offline · ${pendingCount} change${pendingCount !== 1 ? 's' : ''} saved locally`
                : 'No internet connection'}
          </AlertDescription>
          {isOnline && pendingCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSyncNow}
              disabled={syncing}
              className="shrink-0 h-7 px-2 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
};

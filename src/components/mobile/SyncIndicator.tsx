import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

export const SyncIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { getPendingTasksCount, processPendingTasks } = useBackgroundSync();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(getPendingTasksCount());
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [getPendingTasksCount]);

  const syncNow = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await processPendingTasks();
      setPendingCount(getPendingTasksCount());
    } finally {
      setIsSyncing(false);
    }
  };

  if (pendingCount === 0 && isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50"
      >
        <button
          onClick={syncNow}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-2 bg-card border rounded-full px-4 py-2 shadow-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          ) : isOnline ? (
            <Cloud className="h-4 w-4 text-primary" />
          ) : (
            <CloudOff className="h-4 w-4 text-muted-foreground" />
          )}
          
          {pendingCount > 0 && (
            <span className="text-sm font-medium">
              {pendingCount} pending
            </span>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

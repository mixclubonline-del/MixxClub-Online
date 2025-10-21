import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SyncTask {
  id: string;
  data: any;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
}

export const useBackgroundSync = () => {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration.prototype as any)) {
      // Background sync is available
      console.log('Background sync is supported');
    }
  }, []);

  const queueSyncTask = useCallback(async (task: SyncTask) => {
    try {
      // Store task in IndexedDB or localStorage
      const pendingTasks = JSON.parse(localStorage.getItem('pendingSyncTasks') || '[]');
      pendingTasks.push(task);
      localStorage.setItem('pendingSyncTasks', JSON.stringify(pendingTasks));

      // Register sync if available
      if ('serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration.prototype as any)) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-tasks');
      } else {
        // Fallback: try to sync immediately
        await processPendingTasks();
      }

      return true;
    } catch (error) {
      console.error('Failed to queue sync task:', error);
      return false;
    }
  }, []);

  const processPendingTasks = useCallback(async () => {
    const pendingTasks = JSON.parse(localStorage.getItem('pendingSyncTasks') || '[]');
    const failedTasks: SyncTask[] = [];

    for (const task of pendingTasks) {
      try {
        const response = await fetch(task.endpoint, {
          method: task.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task.data),
        });

        if (!response.ok) {
          failedTasks.push(task);
        }
      } catch (error) {
        failedTasks.push(task);
      }
    }

    localStorage.setItem('pendingSyncTasks', JSON.stringify(failedTasks));

    if (failedTasks.length === 0 && pendingTasks.length > 0) {
      toast({
        title: 'Synced',
        description: 'All pending changes have been synced',
      });
    }

    return failedTasks.length === 0;
  }, [toast]);

  const getPendingTasksCount = useCallback(() => {
    const pendingTasks = JSON.parse(localStorage.getItem('pendingSyncTasks') || '[]');
    return pendingTasks.length;
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      processPendingTasks();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [processPendingTasks]);

  return {
    queueSyncTask,
    processPendingTasks,
    getPendingTasksCount,
  };
};

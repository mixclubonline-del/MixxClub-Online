import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uuid } from '@/lib/uuid';

interface QueuedAction {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

const OFFLINE_QUEUE_KEY = 'crm_offline_queue';
const OFFLINE_CACHE_KEY = 'crm_offline_cache';
const MAX_RETRIES = 3;

export function useCRMOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const syncInProgress = useRef(false);

  // Load queued actions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        setQueuedActions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }, []);

  // Save queued actions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queuedActions));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, [queuedActions]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing changes...');
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Changes will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add action to queue
  const queueAction = useCallback((
    type: 'insert' | 'update' | 'delete',
    table: string,
    data: Record<string, unknown>
  ): string => {
    const action: QueuedAction = {
      id: uuid(),
      type,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    setQueuedActions(prev => [...prev, action]);
    
    if (!isOnline) {
      toast.info('Action saved for when you\'re back online');
    }

    return action.id;
  }, [isOnline]);

  // Execute a single queued action
  const executeAction = useCallback(async (action: QueuedAction): Promise<boolean> => {
    try {
      switch (action.type) {
        case 'insert': {
          const { error } = await supabase
            .from(action.table as 'crm_clients')
            .insert(action.data as never);
          if (error) throw error;
          break;
        }
        case 'update': {
          const { id, ...updateData } = action.data;
          const { error } = await supabase
            .from(action.table as 'crm_clients')
            .update(updateData as never)
            .eq('id', id as string);
          if (error) throw error;
          break;
        }
        case 'delete': {
          const { error } = await supabase
            .from(action.table as 'crm_clients')
            .delete()
            .eq('id', action.data.id as string);
          if (error) throw error;
          break;
        }
      }
      return true;
    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error);
      return false;
    }
  }, []);

  // Sync all queued actions
  const syncQueue = useCallback(async () => {
    if (syncInProgress.current || queuedActions.length === 0 || !isOnline) return;

    syncInProgress.current = true;
    setIsSyncing(true);

    const failedActions: QueuedAction[] = [];
    const successCount = { value: 0 };

    for (const action of queuedActions) {
      const success = await executeAction(action);
      
      if (success) {
        successCount.value++;
      } else if (action.retries < MAX_RETRIES) {
        failedActions.push({ ...action, retries: action.retries + 1 });
      } else {
        console.error(`Action ${action.id} failed after ${MAX_RETRIES} retries`);
      }
    }

    setQueuedActions(failedActions);
    setIsSyncing(false);
    syncInProgress.current = false;

    if (successCount.value > 0) {
      toast.success(`Synced ${successCount.value} offline changes`);
    }

    if (failedActions.length > 0) {
      toast.warning(`${failedActions.length} changes failed to sync`);
    }
  }, [queuedActions, isOnline, executeAction]);

  // Trigger sync when online and queue has items
  useEffect(() => {
    if (isOnline && queuedActions.length > 0 && !syncInProgress.current) {
      const timeoutId = setTimeout(syncQueue, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, queuedActions.length, syncQueue]);

  // Cache data for offline use
  const cacheData = useCallback((key: string, data: unknown) => {
    try {
      const cache = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || '{}');
      cache[key] = { data, timestamp: Date.now() };
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  // Get cached data
  const getCachedData = useCallback(<T>(key: string, maxAge: number = 3600000): T | null => {
    try {
      const cache = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || '{}');
      const cached = cache[key];
      
      if (cached && Date.now() - cached.timestamp < maxAge) {
        return cached.data as T;
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }, []);

  // Clear old cache entries
  const clearOldCache = useCallback((maxAge: number = 86400000) => {
    try {
      const cache = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || '{}');
      const now = Date.now();
      
      const cleaned = Object.fromEntries(
        Object.entries(cache).filter(([_, value]) => {
          const entry = value as { timestamp: number };
          return now - entry.timestamp < maxAge;
        })
      );
      
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cleaned));
    } catch (error) {
      console.error('Failed to clear old cache:', error);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    queuedActions,
    pendingCount: queuedActions.length,
    queueAction,
    syncQueue,
    cacheData,
    getCachedData,
    clearOldCache,
  };
}

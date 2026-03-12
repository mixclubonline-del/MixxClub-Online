import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnectedAt: Date | null;
  reconnectAttempts: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface UseConnectionRecoveryOptions {
  sessionId: string;
  userId: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  onReconnect?: () => void;
  onDisconnect?: () => void;
}

export const useConnectionRecovery = ({
  sessionId,
  userId,
  maxReconnectAttempts = 5,
  reconnectDelay = 2000,
  onReconnect,
  onDisconnect
}: UseConnectionRecoveryOptions) => {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isReconnecting: false,
    lastConnectedAt: null,
    reconnectAttempts: 0,
    connectionQuality: 'disconnected'
  });
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Broadcast presence heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!presenceChannelRef.current) return;
    
    try {
      await presenceChannelRef.current.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        session_id: sessionId
      });
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }, [userId, sessionId]);

  // Calculate connection quality based on latency
  const updateConnectionQuality = useCallback((latencyMs: number) => {
    let quality: ConnectionState['connectionQuality'];
    if (latencyMs < 100) quality = 'excellent';
    else if (latencyMs < 300) quality = 'good';
    else if (latencyMs < 1000) quality = 'poor';
    else quality = 'disconnected';
    
    setConnectionState(prev => ({ ...prev, connectionQuality: quality }));
  }, []);

  // Handle successful connection
  const handleConnected = useCallback(() => {
    setConnectionState(prev => ({
      ...prev,
      isConnected: true,
      isReconnecting: false,
      lastConnectedAt: new Date(),
      reconnectAttempts: 0
    }));
    
    // Start heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 5000);
    
    onReconnect?.();
  }, [sendHeartbeat, onReconnect]);

  // Handle disconnection
  const handleDisconnected = useCallback(() => {
    setConnectionState(prev => ({
      ...prev,
      isConnected: false,
      connectionQuality: 'disconnected'
    }));
    
    // Stop heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    onDisconnect?.();
  }, [onDisconnect]);

  // Attempt reconnection
  const attemptReconnect = useCallback(async () => {
    const currentAttempts = connectionState.reconnectAttempts;
    
    if (currentAttempts >= maxReconnectAttempts) {
      toast({
        title: "Connection Lost",
        description: "Unable to reconnect. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    setConnectionState(prev => ({
      ...prev,
      isReconnecting: true,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));
    
    // Exponential backoff
    const delay = reconnectDelay * Math.pow(2, currentAttempts);
    
    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        // Resubscribe to presence channel
        if (presenceChannelRef.current) {
          await presenceChannelRef.current.unsubscribe();
        }
        
        presenceChannelRef.current = supabase.channel(`collaboration-presence-${sessionId}`);
        
        presenceChannelRef.current
          .on('presence', { event: 'sync' }, () => {
            handleConnected();
          })
          .on('presence', { event: 'join' }, () => {})
          .on('presence', { event: 'leave' }, () => {})
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await sendHeartbeat();
              handleConnected();
              toast({
                title: "Reconnected",
                description: "Connection restored successfully."
              });
            } else if (status === 'CHANNEL_ERROR') {
              attemptReconnect();
            }
          });
      } catch (error) {
        console.error('Reconnection failed:', error);
        attemptReconnect();
      }
    }, delay);
  }, [connectionState.reconnectAttempts, maxReconnectAttempts, reconnectDelay, sessionId, sendHeartbeat, handleConnected, toast]);

  // Initialize connection
  const initializeConnection = useCallback(async () => {
    presenceChannelRef.current = supabase.channel(`collaboration-presence-${sessionId}`);
    
    presenceChannelRef.current
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannelRef.current?.presenceState();
        console.log('Presence sync:', presenceState);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await sendHeartbeat();
          handleConnected();
        } else if (status === 'CHANNEL_ERROR') {
          handleDisconnected();
          attemptReconnect();
        } else if (status === 'CLOSED') {
          handleDisconnected();
        }
      });
  }, [sessionId, sendHeartbeat, handleConnected, handleDisconnected, attemptReconnect]);

  // Manual reconnect trigger
  const forceReconnect = useCallback(() => {
    setConnectionState(prev => ({ ...prev, reconnectAttempts: 0 }));
    attemptReconnect();
  }, [attemptReconnect]);

  // Save session state to localStorage for recovery
  const saveSessionState = useCallback((state: Record<string, unknown>) => {
    try {
      localStorage.setItem(`collaboration-state-${sessionId}`, JSON.stringify({
        ...state,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save session state:', error);
    }
  }, [sessionId]);

  // Restore session state from localStorage
  const restoreSessionState = useCallback((): Record<string, unknown> | null => {
    try {
      const saved = localStorage.getItem(`collaboration-state-${sessionId}`);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      const savedAt = new Date(parsed.savedAt);
      const now = new Date();
      
      // Only restore if saved within last hour
      if (now.getTime() - savedAt.getTime() > 60 * 60 * 1000) {
        localStorage.removeItem(`collaboration-state-${sessionId}`);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to restore session state:', error);
      return null;
    }
  }, [sessionId]);

  // Clear saved session state
  const clearSessionState = useCallback(() => {
    localStorage.removeItem(`collaboration-state-${sessionId}`);
  }, [sessionId]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      if (!connectionState.isConnected) {
        attemptReconnect();
      }
    };
    
    const handleOffline = () => {
      handleDisconnected();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionState.isConnected, attemptReconnect, handleDisconnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    connectionState,
    initializeConnection,
    forceReconnect,
    saveSessionState,
    restoreSessionState,
    clearSessionState,
    updateConnectionQuality
  };
};

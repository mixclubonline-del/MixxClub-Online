import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: string;
}

interface UseRealtimeOptions {
  channel: string;
  event?: string;
  onMessage?: (event: RealtimeEvent) => void;
  autoConnect?: boolean;
}

export function useRealtime({
  channel,
  event = '*',
  onMessage,
  autoConnect = true,
}: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    if (!autoConnect) return;

    const channelInstance = supabase.channel(channel);

    channelInstance
      .on('broadcast', { event }, (payload) => {
        const newEvent: RealtimeEvent = {
          type: payload.event,
          payload: payload.payload,
          timestamp: new Date().toISOString(),
        };

        setEvents((prev) => [...prev.slice(-99), newEvent]); // Keep last 100 events
        onMessage?.(newEvent);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    setRealtimeChannel(channelInstance);

    return () => {
      channelInstance.unsubscribe();
      setIsConnected(false);
    };
  }, [channel, event, autoConnect]);

  const broadcast = async (event: string, payload: any) => {
    if (!realtimeChannel) {
      console.error('Channel not initialized');
      return false;
    }

    try {
      await realtimeChannel.send({
        type: 'broadcast',
        event,
        payload,
      });
      return true;
    } catch (error) {
      console.error('Broadcast error:', error);
      return false;
    }
  };

  const connect = () => {
    if (realtimeChannel) {
      realtimeChannel.subscribe();
    }
  };

  const disconnect = () => {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      setIsConnected(false);
    }
  };

  return {
    isConnected,
    events,
    broadcast,
    connect,
    disconnect,
  };
}

// Hook for database changes
export function useRealtimeTable<T = any>(
  tableName: string,
  filters?: { event?: 'INSERT' | 'UPDATE' | 'DELETE'; schema?: string }
) {
  const [data, setData] = useState<T[]>([]);
  const [lastChange, setLastChange] = useState<{
    event: string;
    record: T;
    old?: T;
  } | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`db-changes-${tableName}`);
    
    // Subscribe to postgres changes
    channel.on(
      'postgres_changes' as any,
      {
        event: filters?.event || '*',
        schema: filters?.schema || 'public',
        table: tableName,
      } as any,
      (payload: any) => {
        setLastChange({
          event: payload.eventType,
          record: payload.new as T,
          old: payload.old as T,
        });

        // Update local data based on event type
        if (payload.eventType === 'INSERT') {
          setData((prev) => [...prev, payload.new as T]);
        } else if (payload.eventType === 'UPDATE') {
          setData((prev) =>
            prev.map((item: any) =>
              item.id === (payload.new as any).id ? (payload.new as T) : item
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setData((prev) =>
            prev.filter((item: any) => item.id !== (payload.old as any).id)
          );
        }
      }
    );
    
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [tableName, filters?.event, filters?.schema]);

  return { data, lastChange };
}

// Hook for presence (who's online)
export function usePresence(channelName: string) {
  const [users, setUsers] = useState<Record<string, any>>({});
  const [myPresence, setMyPresence] = useState<any>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setUsers(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const presenceData = {
              user_id: user.id,
              online_at: new Date().toISOString(),
            };
            await channel.track(presenceData);
            setMyPresence(presenceData);
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [channelName]);

  return { users, myPresence, userCount: Object.keys(users).length };
}

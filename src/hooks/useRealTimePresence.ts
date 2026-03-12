import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PresenceState {
  userId: string;
  userName: string;
  userAvatar?: string;
  onlineAt: string;
  cursorPosition?: { x: number; y: number };
}

export const useRealTimePresence = (channelName: string) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceState[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.userId) {
              users.push(presence as PresenceState);
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, () => {})
      .on('presence', { event: 'leave' }, () => {})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

          // Track presence
          await presenceChannel.track({
            userId: user.id,
            userName: profile?.full_name || 'Unknown User',
            userAvatar: profile?.avatar_url,
            onlineAt: new Date().toISOString(),
          });

          console.log('[Presence] Subscribed to channel:', channelName);
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
      console.log('[Presence] Unsubscribed from channel:', channelName);
    };
  }, [channelName, user]);

  const updateCursorPosition = async (x: number, y: number) => {
    if (channel) {
      await channel.track({
        userId: user?.id,
        cursorPosition: { x, y },
      });
    }
  };

  return {
    onlineUsers,
    updateCursorPosition,
    isConnected: !!channel,
  };
};

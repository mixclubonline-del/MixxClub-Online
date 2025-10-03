import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  lastActive: number;
}

export const useProjectPresence = (projectId: string, currentUserId?: string) => {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!projectId || !currentUserId) return;

    const presenceChannel = supabase.channel(`project_${projectId}`, {
      config: { presence: { key: currentUserId } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key];
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            if (presence.id !== currentUserId) {
              users.push({
                id: presence.id,
                name: presence.name || 'Unknown',
                avatar: presence.avatar,
                cursor: presence.cursor,
                lastActive: presence.lastActive || Date.now()
              });
            }
          }
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            id: currentUserId,
            name: 'Current User',
            lastActive: Date.now()
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [projectId, currentUserId]);

  const updateCursor = async (x: number, y: number) => {
    if (channel) {
      await channel.track({
        id: currentUserId,
        cursor: { x, y },
        lastActive: Date.now()
      });
    }
  };

  return { onlineUsers, updateCursor };
};

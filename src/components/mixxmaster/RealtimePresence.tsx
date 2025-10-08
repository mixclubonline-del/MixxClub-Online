import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Circle } from 'lucide-react';

interface PresenceUser {
  userId: string;
  userName: string;
  joinedAt: string;
  isActive: boolean;
}

interface RealtimePresenceProps {
  sessionId: string;
}

export const RealtimePresence = ({ sessionId }: RealtimePresenceProps) => {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const initPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUser(user.id);

      // Create channel for presence
      const channel = supabase.channel(`mixxmaster:${sessionId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      // Track presence state
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const users: PresenceUser[] = [];

          Object.keys(state).forEach((userId) => {
            const presences = state[userId] as any[];
            if (presences.length > 0) {
              const presence = presences[0];
              users.push({
                userId,
                userName: presence.userName || 'Anonymous',
                joinedAt: presence.joinedAt,
                isActive: true,
              });
            }
          });

          setPresenceUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track current user's presence
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single();

            await channel.track({
              userId: user.id,
              userName: profile?.full_name || 'Anonymous User',
              joinedAt: new Date().toISOString(),
            });
          }
        });

      return () => {
        channel.unsubscribe();
      };
    };

    initPresence();
  }, [sessionId]);

  if (presenceUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
      <Users className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        {presenceUsers.slice(0, 5).map((user) => (
          <div key={user.userId} className="relative">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user.isActive && (
              <Circle className="absolute bottom-0 right-0 h-2.5 w-2.5 fill-green-500 text-green-500" />
            )}
          </div>
        ))}
        {presenceUsers.length > 5 && (
          <Badge variant="secondary" className="ml-1">
            +{presenceUsers.length - 5}
          </Badge>
        )}
      </div>
      <span className="text-sm text-muted-foreground ml-auto">
        {presenceUsers.length} {presenceUsers.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
};

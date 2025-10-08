import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  userId: string;
  userName: string;
  cursor?: { x: number; y: number };
  color: string;
}

interface RealtimePresenceProps {
  sessionId: string;
  showCursors?: boolean;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 70%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(40, 70%, 50%)',
  'hsl(160, 70%, 50%)'
];

export function RealtimePresence({ sessionId, showCursors = true }: RealtimePresenceProps) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    setupPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [sessionId]);

  const setupPresence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const newChannel = supabase.channel(`presence:${sessionId}`, {
      config: {
        presence: { key: user.id }
      }
    });

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        const presenceUsers = Object.entries(state).flatMap(([key, presences]) =>
          presences.map((p: any) => ({
            userId: p.user_id,
            userName: p.user_name || 'Anonymous',
            cursor: p.cursor,
            color: p.color || COLORS[0]
          }))
        );
        setUsers(presenceUsers);
      });

    newChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await newChannel.track({
          user_id: user.id,
          user_name: user.email?.split('@')[0] || 'Anonymous',
          color: userColor,
          cursor: null,
          online_at: new Date().toISOString()
        });
      }
    });

    setChannel(newChannel);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex -space-x-2">
      <TooltipProvider>
        {users.map((user) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger>
              <Avatar
                className="border-2 hover:z-10 transition-transform hover:scale-110"
                style={{ borderColor: user.color }}
              >
                <AvatarFallback style={{ backgroundColor: user.color }}>
                  {getInitials(user.userName)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.userName}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

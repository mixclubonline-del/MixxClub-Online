import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  lastActive: number;
}

interface SessionPresenceProps {
  sessionId: string;
  currentUserId: string;
  maxVisible?: number;
  showStatus?: boolean;
}

export const SessionPresence = ({
  sessionId,
  currentUserId,
  maxVisible = 5,
  showStatus = true
}: SessionPresenceProps) => {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const presenceChannel = supabase.channel(`session_presence_${sessionId}`, {
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
                status: getStatus(presence.lastActive),
                lastActive: presence.lastActive || Date.now()
              });
            }
          }
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            id: currentUserId,
            name: 'Current User',
            lastActive: Date.now(),
            status: 'active'
          });
        }
      });

    setChannel(presenceChannel);

    // Update presence every 30 seconds
    const interval = setInterval(async () => {
      if (presenceChannel) {
        await presenceChannel.track({
          id: currentUserId,
          lastActive: Date.now(),
          status: 'active'
        });
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      presenceChannel.unsubscribe();
    };
  }, [sessionId, currentUserId]);

  const getStatus = (lastActive: number): 'active' | 'idle' | 'away' => {
    const now = Date.now();
    const diff = now - lastActive;

    if (diff < 60000) return 'active'; // < 1 min
    if (diff < 300000) return 'idle'; // < 5 min
    return 'away';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, onlineUsers.length - maxVisible);

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <div className="flex -space-x-2">
          <AnimatePresence>
            {visibleUsers.map((user, index) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, x: -20 }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{ scale: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <Avatar className="w-10 h-10 border-2 border-background hover:scale-110 transition-transform cursor-pointer">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {showStatus && (
                      <div 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                      />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </AnimatePresence>

          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                >
                  <span className="text-xs font-medium">+{hiddenCount}</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hiddenCount} more online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {onlineUsers.length > 0 && (
        <Badge variant="secondary" className="gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          {onlineUsers.length} online
        </Badge>
      )}
    </div>
  );
};

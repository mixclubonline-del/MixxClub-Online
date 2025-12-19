import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

const TYPING_TIMEOUT = 3000; // 3 seconds

export const useTypingIndicator = (channelName: string, currentUserId: string, currentUserName: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [channel, setChannel] = useState<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingRef = useRef<number>(0);

  useEffect(() => {
    if (!currentUserId || !channelName) return;

    const typingChannel = supabase.channel(`typing-${channelName}`);

    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === currentUserId) return;

        setTypingUsers(prev => {
          const existing = prev.findIndex(u => u.userId === payload.userId);
          const now = Date.now();
          
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { ...payload, timestamp: now };
            return updated;
          }
          
          return [...prev, { ...payload, timestamp: now }];
        });
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== payload.userId));
      })
      .subscribe();

    setChannel(typingChannel);

    // Cleanup stale typing indicators
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(u => now - u.timestamp < TYPING_TIMEOUT)
      );
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
      typingChannel.unsubscribe();
    };
  }, [channelName, currentUserId]);

  const sendTyping = useCallback(() => {
    if (!channel) return;
    
    const now = Date.now();
    // Throttle typing events to once per second
    if (now - lastTypingRef.current < 1000) return;
    
    lastTypingRef.current = now;
    
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUserId,
        userName: currentUserName,
      }
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [channel, currentUserId, currentUserName]);

  const stopTyping = useCallback(() => {
    if (!channel) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    channel.send({
      type: 'broadcast',
      event: 'stop_typing',
      payload: {
        userId: currentUserId,
      }
    });
  }, [channel, currentUserId]);

  return {
    typingUsers: typingUsers.filter(u => u.userId !== currentUserId),
    sendTyping,
    stopTyping,
  };
};

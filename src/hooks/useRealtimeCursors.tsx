import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CursorPosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface RemoteCursorData {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  position: CursorPosition;
  selection?: SelectionRange;
  isIdle: boolean;
  lastActive: number;
}

export interface SelectionRange {
  startTime: number;
  endTime: number;
  trackId?: string;
}

const CURSOR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

const THROTTLE_MS = 50;
const IDLE_TIMEOUT_MS = 3000;

export const useRealtimeCursors = (
  sessionId: string,
  userId: string,
  userName: string,
  userAvatar?: string
) => {
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursorData>>(new Map());
  const [isFollowing, setIsFollowing] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const myColorRef = useRef<string>(CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]);

  useEffect(() => {
    if (!sessionId || !userId) return;

    const channel = supabase.channel(`cursors-${sessionId}`, {
      config: { presence: { key: userId } }
    });

    channel
      .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
        if (payload.userId === userId) return;
        
        setRemoteCursors(prev => {
          const updated = new Map(prev);
          const existing = updated.get(payload.userId);
          
          updated.set(payload.userId, {
            id: payload.userId,
            name: payload.userName || 'Unknown',
            avatar: payload.userAvatar,
            color: payload.color || CURSOR_COLORS[0],
            position: payload.position,
            selection: existing?.selection,
            isIdle: false,
            lastActive: Date.now()
          });
          
          return updated;
        });
      })
      .on('broadcast', { event: 'cursor_selection' }, ({ payload }) => {
        if (payload.userId === userId) return;
        
        setRemoteCursors(prev => {
          const updated = new Map(prev);
          const existing = updated.get(payload.userId);
          
          if (existing) {
            updated.set(payload.userId, {
              ...existing,
              selection: payload.selection,
              lastActive: Date.now()
            });
          }
          
          return updated;
        });
      })
      .on('broadcast', { event: 'cursor_leave' }, ({ payload }) => {
        setRemoteCursors(prev => {
          const updated = new Map(prev);
          updated.delete(payload.userId);
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setRemoteCursors(prev => {
          const updated = new Map(prev);
          leftPresences.forEach((presence: any) => {
            updated.delete(presence.id || presence.userId);
          });
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: userId,
            name: userName,
            avatar: userAvatar,
            color: myColorRef.current,
            joinedAt: Date.now()
          });
        }
      });

    channelRef.current = channel;

    // Idle detection interval
    const idleInterval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors(prev => {
        const updated = new Map(prev);
        let hasChanges = false;
        
        updated.forEach((cursor, id) => {
          if (!cursor.isIdle && now - cursor.lastActive > IDLE_TIMEOUT_MS) {
            updated.set(id, { ...cursor, isIdle: true });
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => {
      clearInterval(idleInterval);
      channel.send({
        type: 'broadcast',
        event: 'cursor_leave',
        payload: { userId }
      });
      channel.unsubscribe();
    };
  }, [sessionId, userId, userName, userAvatar]);

  const broadcastCursorMove = useCallback((position: CursorPosition) => {
    const now = Date.now();
    if (now - lastBroadcastRef.current < THROTTLE_MS) return;
    
    lastBroadcastRef.current = now;
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        userId,
        userName,
        userAvatar,
        color: myColorRef.current,
        position
      }
    });
  }, [userId, userName, userAvatar]);

  const broadcastSelection = useCallback((selection: SelectionRange | null) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'cursor_selection',
      payload: {
        userId,
        selection
      }
    });
  }, [userId]);

  const followUser = useCallback((targetUserId: string | null) => {
    setIsFollowing(targetUserId);
  }, []);

  const getFollowedCursor = useCallback(() => {
    if (!isFollowing) return null;
    return remoteCursors.get(isFollowing) || null;
  }, [isFollowing, remoteCursors]);

  return {
    remoteCursors: Array.from(remoteCursors.values()),
    broadcastCursorMove,
    broadcastSelection,
    followUser,
    isFollowing,
    getFollowedCursor,
    myColor: myColorRef.current
  };
};

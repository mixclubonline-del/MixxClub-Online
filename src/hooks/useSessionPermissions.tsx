import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SessionRole = 'host' | 'editor' | 'viewer';

export interface SessionPermissions {
  canEditTracks: boolean;
  canAddTracks: boolean;
  canDeleteTracks: boolean;
  canEditEffects: boolean;
  canChat: boolean;
  canInvite: boolean;
  canKick: boolean;
  canChangeRoles: boolean;
  canExport: boolean;
  canLockTracks: boolean;
}

export interface SessionParticipant {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  role: SessionRole;
  joinedAt: string;
  isOnline: boolean;
  lockedTracks: string[];
}

const rolePermissions: Record<SessionRole, SessionPermissions> = {
  host: {
    canEditTracks: true,
    canAddTracks: true,
    canDeleteTracks: true,
    canEditEffects: true,
    canChat: true,
    canInvite: true,
    canKick: true,
    canChangeRoles: true,
    canExport: true,
    canLockTracks: true,
  },
  editor: {
    canEditTracks: true,
    canAddTracks: true,
    canDeleteTracks: false,
    canEditEffects: true,
    canChat: true,
    canInvite: false,
    canKick: false,
    canChangeRoles: false,
    canExport: true,
    canLockTracks: true,
  },
  viewer: {
    canEditTracks: false,
    canAddTracks: false,
    canDeleteTracks: false,
    canEditEffects: false,
    canChat: true,
    canInvite: false,
    canKick: false,
    canChangeRoles: false,
    canExport: false,
    canLockTracks: false,
  },
};

interface UseSessionPermissionsProps {
  sessionId: string;
  userId: string;
}

export function useSessionPermissions({ sessionId, userId }: UseSessionPermissionsProps) {
  const [myRole, setMyRole] = useState<SessionRole>('viewer');
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [lockedTracks, setLockedTracks] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const myPermissions = rolePermissions[myRole];

  // Load session participants and roles
  useEffect(() => {
    const loadParticipants = async () => {
      setIsLoading(true);
      try {
        // Check if current user is the host
        const { data: session } = await supabase
          .from('collaboration_sessions')
          .select('host_user_id, session_state')
          .eq('id', sessionId)
          .single();

        if (session) {
          const isHost = session.host_user_id === userId;
          setMyRole(isHost ? 'host' : 'editor');
          
          // Parse session state for participants and locked tracks
          const state = session.session_state as any;
          if (state?.lockedTracks) {
            setLockedTracks(new Map(Object.entries(state.lockedTracks)));
          }
        }
      } catch (error) {
        console.error('Error loading session permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParticipants();
  }, [sessionId, userId]);

  const changeRole = useCallback(async (targetUserId: string, newRole: SessionRole) => {
    if (!myPermissions.canChangeRoles) {
      console.warn('No permission to change roles');
      return false;
    }

    try {
      const { data: session } = await supabase
        .from('collaboration_sessions')
        .select('session_state')
        .eq('id', sessionId)
        .single();

      const currentState = (session?.session_state as any) || {};
      const roles = currentState.roles || {};
      roles[targetUserId] = newRole;

      await supabase
        .from('collaboration_sessions')
        .update({
          session_state: { ...currentState, roles } as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      setParticipants(prev =>
        prev.map(p => (p.userId === targetUserId ? { ...p, role: newRole } : p))
      );

      return true;
    } catch (error) {
      console.error('Error changing role:', error);
      return false;
    }
  }, [sessionId, myPermissions.canChangeRoles]);

  const lockTrack = useCallback(async (trackId: string) => {
    if (!myPermissions.canLockTracks) {
      console.warn('No permission to lock tracks');
      return false;
    }

    try {
      const { data: session } = await supabase
        .from('collaboration_sessions')
        .select('session_state')
        .eq('id', sessionId)
        .single();

      const currentState = (session?.session_state as any) || {};
      const tracks = currentState.lockedTracks || {};
      tracks[trackId] = userId;

      await supabase
        .from('collaboration_sessions')
        .update({
          session_state: { ...currentState, lockedTracks: tracks } as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      setLockedTracks(prev => new Map(prev).set(trackId, userId));
      return true;
    } catch (error) {
      console.error('Error locking track:', error);
      return false;
    }
  }, [sessionId, userId, myPermissions.canLockTracks]);

  const unlockTrack = useCallback(async (trackId: string) => {
    const lockedBy = lockedTracks.get(trackId);
    if (lockedBy && lockedBy !== userId && myRole !== 'host') {
      console.warn('Cannot unlock track locked by another user');
      return false;
    }

    try {
      const { data: session } = await supabase
        .from('collaboration_sessions')
        .select('session_state')
        .eq('id', sessionId)
        .single();

      const currentState = (session?.session_state as any) || {};
      const tracks = { ...(currentState.lockedTracks || {}) };
      delete tracks[trackId];

      await supabase
        .from('collaboration_sessions')
        .update({
          session_state: { ...currentState, lockedTracks: tracks } as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      setLockedTracks(prev => {
        const next = new Map(prev);
        next.delete(trackId);
        return next;
      });
      return true;
    } catch (error) {
      console.error('Error unlocking track:', error);
      return false;
    }
  }, [sessionId, userId, myRole, lockedTracks]);

  const isTrackLocked = useCallback((trackId: string) => {
    return lockedTracks.has(trackId);
  }, [lockedTracks]);

  const isTrackLockedByMe = useCallback((trackId: string) => {
    return lockedTracks.get(trackId) === userId;
  }, [lockedTracks, userId]);

  const canEditTrack = useCallback((trackId: string) => {
    if (!myPermissions.canEditTracks) return false;
    const lockedBy = lockedTracks.get(trackId);
    if (lockedBy && lockedBy !== userId) return false;
    return true;
  }, [myPermissions.canEditTracks, lockedTracks, userId]);

  const kickUser = useCallback(async (targetUserId: string) => {
    if (!myPermissions.canKick) {
      console.warn('No permission to kick users');
      return false;
    }

    // This would typically broadcast a kick event via realtime
    console.log('Kicking user:', targetUserId);
    return true;
  }, [myPermissions.canKick]);

  return {
    myRole,
    myPermissions,
    participants,
    lockedTracks,
    isLoading,
    changeRole,
    lockTrack,
    unlockTrack,
    isTrackLocked,
    isTrackLockedByMe,
    canEditTrack,
    kickUser,
  };
}

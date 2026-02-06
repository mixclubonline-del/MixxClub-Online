import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOnlineUsers } from './useOnlineUsers';

interface CollaborationData {
  activeUsers: number;
  onlineEngineers: number;
  activeSessions: number;
  isLive: boolean;
  recentActivity: string[];
}

/**
 * Collaboration status wired to real database queries
 * Follows Live Data First doctrine - no Math.random() simulation
 */
export const useCollaborationStatus = (): CollaborationData => {
  const { totalOnline, onlineEngineers } = useOnlineUsers();

  const { data: sessionsData } = useQuery({
    queryKey: ['active-sessions-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('collaboration_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-collaboration-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('title')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data?.map(a => a.title) || [];
    },
    staleTime: 30000,
  });

  const activeSessions = sessionsData || 0;

  return {
    activeUsers: totalOnline,
    onlineEngineers,
    activeSessions,
    isLive: activeSessions > 0 || totalOnline > 0,
    recentActivity: recentActivity || [
      'Waiting for activity...',
    ],
  };
};
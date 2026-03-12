import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OnlineUsersData {
  totalOnline: number;
  onlineEngineers: number;
  onlineArtists: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Query profiles with recent activity (last 15 minutes)
 * Single batched query instead of 3 separate HEAD requests
 */
export const useOnlineUsers = (): OnlineUsersData => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['online-users-count'],
    queryFn: async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      // Single query: fetch role for all active users, then count client-side
      const { data: activeUsers, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .gte('last_active_at', fifteenMinutesAgo);

      if (fetchError) throw fetchError;

      const list = activeUsers || [];
      return {
        totalOnline: list.length,
        onlineEngineers: list.filter(u => u.role === 'engineer').length,
        onlineArtists: list.filter(u => u.role === 'artist').length,
      };
    },
    staleTime: 60000,
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
  });

  return {
    totalOnline: data?.totalOnline || 0,
    onlineEngineers: data?.onlineEngineers || 0,
    onlineArtists: data?.onlineArtists || 0,
    isLoading,
    error: error as Error | null,
  };
};

export default useOnlineUsers;

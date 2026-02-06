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
 * Follows Live Data First doctrine - no Math.random() simulation
 */
export const useOnlineUsers = (): OnlineUsersData => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['online-users-count'],
    queryFn: async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      // Get total online users
      const { count: totalCount, error: totalError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('last_active_at', fifteenMinutesAgo);

      if (totalError) throw totalError;

      // Get online engineers
      const { count: engineerCount, error: engineerError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'engineer')
        .gte('last_active_at', fifteenMinutesAgo);

      if (engineerError) throw engineerError;

      // Get online artists
      const { count: artistCount, error: artistError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'artist')
        .gte('last_active_at', fifteenMinutesAgo);

      if (artistError) throw artistError;

      return {
        totalOnline: totalCount || 0,
        onlineEngineers: engineerCount || 0,
        onlineArtists: artistCount || 0,
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
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

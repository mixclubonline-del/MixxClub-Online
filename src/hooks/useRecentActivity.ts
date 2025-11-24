import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentActivity = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['recent-activity', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Fetch recent matches, messages, and project updates
      const { data, error } = await supabase
        .from('matches')
        .select('*, projects(title)')
        .or(`artist_id.eq.${userId},engineer_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

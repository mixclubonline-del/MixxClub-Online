import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['project-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [projectsResult, matchesResult, revenueResult] = await Promise.all([
        supabase
          .from('projects')
          .select('id, status', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('matches')
          .select('id', { count: 'exact', head: true })
          .or(`artist_id.eq.${userId},engineer_id.eq.${userId}`),
        supabase
          .from('revenue_streams')
          .select('amount')
          .eq('user_id', userId),
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      return {
        totalProjects: projectsResult.count || 0,
        totalMatches: matchesResult.count || 0,
        totalRevenue,
        activeProjects: 0, // Will calculate from status
      };
    },
    enabled: !!userId,
  });
};

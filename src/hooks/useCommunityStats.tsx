import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityStats {
  totalUsers: number;
  totalArtists: number;
  totalEngineers: number;
  activeSessions: number;
  projectsCompleted: number;
  totalPremieres: number;
  activeBattles: number;
  totalEarnings: number;
  activeNow: number;
}

export const useCommunityStats = () => {
  return useQuery({
    queryKey: ['community-stats'],
    queryFn: async (): Promise<CommunityStats> => {
      const [
        profilesResult,
        sessionsResult,
        projectsResult,
        premieresResult,
        battlesResult,
        earningsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id, role', { count: 'exact', head: false }),
        supabase.from('collaboration_sessions').select('id, status', { count: 'exact', head: false }),
        supabase.from('projects').select('id, status', { count: 'exact', head: false }),
        supabase.from('premieres').select('id', { count: 'exact', head: true }),
        supabase.from('battles').select('id, status', { count: 'exact', head: false }),
        supabase.from('engineer_earnings').select('amount')
      ]);

      const profiles = profilesResult.data || [];
      const sessions = sessionsResult.data || [];
      const projects = projectsResult.data || [];
      const battles = battlesResult.data || [];
      const earnings = earningsResult.data || [];

      const totalUsers = profiles.length;
      const totalArtists = profiles.filter((p) => p.role === 'artist' || !p.role).length;
      const totalEngineers = profiles.filter((p) => p.role === 'engineer').length;
      const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'live').length;
      const projectsCompleted = projects.filter((p) => p.status === 'completed' || p.status === 'delivered').length;
      const activeBattles = battles.filter((b) => b.status === 'active' || b.status === 'live').length;
      const totalEarnings = earnings.reduce((sum: number, e) => sum + (e.amount || 0), 0);

      // Simulate active now (would be realtime in production)
      const activeNow = Math.max(Math.floor(totalUsers * 0.05), activeSessions * 2 + 5);

      return {
        totalUsers,
        totalArtists,
        totalEngineers,
        activeSessions,
        projectsCompleted,
        totalPremieres: premieresResult.count || 0,
        activeBattles,
        totalEarnings,
        activeNow
      };
    },
    staleTime: 30000,
    refetchInterval: 60000
  });
};

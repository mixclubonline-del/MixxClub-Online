import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Unlockable {
  id: string;
  unlock_type: 'community' | 'artist' | 'engineer';
  name: string;
  description: string | null;
  icon_name: string;
  metric_type: string;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  reward_description: string | null;
  tier: number;
  ai_reasoning: string | null;
  created_by: string;
}

export interface UnlockablesData {
  community: Unlockable[];
  artist: Unlockable[];
  engineer: Unlockable[];
  platformStats: {
    userCount: number;
    sessionCount: number;
    projectCount: number;
  };
}

async function fetchUnlockablesWithProgress(): Promise<UnlockablesData> {
  // Fetch platform stats
  const [profilesResult, sessionsResult, projectsResult, unlockablesResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('collaboration_sessions').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('unlockables').select('*').order('tier', { ascending: true }),
  ]);

  const platformStats = {
    userCount: profilesResult.count || 0,
    sessionCount: sessionsResult.count || 0,
    projectCount: projectsResult.count || 0,
  };

  const unlockables = (unlockablesResult.data || []).map((u) => {
    let currentValue = 0;

    switch (u.metric_type) {
      case 'user_count':
        currentValue = platformStats.userCount;
        break;
      case 'sessions_completed':
        currentValue = platformStats.sessionCount;
        break;
      case 'projects_delivered':
        currentValue = platformStats.projectCount;
        break;
      default:
        currentValue = 0;
    }

    const progressPercentage = Math.min(
      Math.round((currentValue / u.target_value) * 100),
      100
    );

    return {
      ...u,
      current_value: currentValue,
      progress_percentage: progressPercentage,
    } as Unlockable;
  });

  return {
    community: unlockables.filter(u => u.unlock_type === 'community'),
    artist: unlockables.filter(u => u.unlock_type === 'artist'),
    engineer: unlockables.filter(u => u.unlock_type === 'engineer'),
    platformStats,
  };
}

export function useUnlockables() {
  return useQuery({
    queryKey: ['unlockables'],
    queryFn: fetchUnlockablesWithProgress,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useCommunityUnlockables() {
  const { data, ...rest } = useUnlockables();
  return {
    data: data?.community || [],
    platformStats: data?.platformStats,
    ...rest,
  };
}

export function useArtistUnlockables() {
  const { data, ...rest } = useUnlockables();
  return {
    data: data?.artist || [],
    ...rest,
  };
}

export function useEngineerUnlockables() {
  const { data, ...rest } = useUnlockables();
  return {
    data: data?.engineer || [],
    ...rest,
  };
}

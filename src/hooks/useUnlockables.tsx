import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Unlockable {
  id: string;
  unlock_type: 'community' | 'artist' | 'engineer' | 'producer' | 'fan';
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
  producer: Unlockable[];
  fan: Unlockable[];
  platformStats: {
    userCount: number;
    sessionCount: number;
    projectCount: number;
    beatsUploaded: number;
    beatsSold: number;
    totalDay1Badges: number;
    totalArtistsSupported: number;
  };
}

interface PersonalProgressResult {
  metrics: Record<string, number>;
  unlockables: Unlockable[];
}

// Helper to aggregate fan stats
function aggregateFanStat(fanStats: Record<string, unknown>[] | null, field: string): number {
  if (!fanStats || fanStats.length === 0) return 0;
  return fanStats.reduce((sum, stat) => sum + (Number(stat[field]) || 0), 0);
}

// Helper to get max value from fan stats (for streaks)
function maxFanStat(fanStats: Record<string, unknown>[] | null, field: string): number {
  if (!fanStats || fanStats.length === 0) return 0;
  return Math.max(...fanStats.map(stat => Number(stat[field]) || 0));
}

async function fetchUnlockablesWithProgress(): Promise<UnlockablesData> {
  // Fetch all platform stats in parallel
  const [
    profilesResult,
    sessionsResult,
    projectsResult,
    producerBeatsResult,
    beatPurchasesResult,
    fanStatsResult,
    artistDay1sResult,
    unlockablesResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('collaboration_sessions').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('producer_beats').select('id', { count: 'exact', head: true }),
    supabase.from('beat_purchases').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('fan_stats').select('*'),
    supabase.from('artist_day1s').select('id', { count: 'exact', head: true }),
    supabase.from('unlockables').select('*').order('tier', { ascending: true }),
  ]);

  const fanStats = (fanStatsResult.data || []) as Record<string, unknown>[];

  const platformStats = {
    userCount: profilesResult.count || 0,
    sessionCount: sessionsResult.count || 0,
    projectCount: projectsResult.count || 0,
    beatsUploaded: producerBeatsResult.count || 0,
    beatsSold: beatPurchasesResult.count || 0,
    totalDay1Badges: artistDay1sResult.count || 0,
    totalArtistsSupported: aggregateFanStat(fanStats, 'artists_supported'),
  };

  const unlockables = (unlockablesResult.data || []).map((u): Unlockable => {
    let currentValue = 0;

    switch (u.metric_type) {
      // Community metrics
      case 'user_count':
        currentValue = platformStats.userCount;
        break;
      case 'sessions_completed':
        currentValue = platformStats.sessionCount;
        break;
      case 'projects_delivered':
        currentValue = platformStats.projectCount;
        break;
      
      // Producer metrics
      case 'beats_uploaded':
        currentValue = platformStats.beatsUploaded;
        break;
      case 'beats_sold':
        currentValue = platformStats.beatsSold;
        break;
      
      // Fan metrics
      case 'day1_badges':
        currentValue = platformStats.totalDay1Badges;
        break;
      case 'engagement_streak':
        currentValue = maxFanStat(fanStats, 'engagement_streak');
        break;
      case 'artists_supported':
        currentValue = platformStats.totalArtistsSupported;
        break;
      case 'longest_streak':
        currentValue = maxFanStat(fanStats, 'longest_streak');
        break;
      case 'mixxcoinz_earned':
        currentValue = aggregateFanStat(fanStats, 'mixxcoinz_earned');
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
    producer: unlockables.filter(u => u.unlock_type === 'producer'),
    fan: unlockables.filter(u => u.unlock_type === 'fan'),
    platformStats,
  };
}

// Helper to map raw unlockable data to Unlockable type
function mapToUnlockable(u: Record<string, unknown>, currentValue: number): Unlockable {
  const targetValue = Number(u.target_value) || 1;
  const progressPercentage = Math.min(Math.round((currentValue / targetValue) * 100), 100);
  
  return {
    id: String(u.id),
    unlock_type: u.unlock_type as Unlockable['unlock_type'],
    name: String(u.name),
    description: u.description as string | null,
    icon_name: String(u.icon_name || 'star'),
    metric_type: String(u.metric_type),
    target_value: targetValue,
    current_value: currentValue,
    progress_percentage: progressPercentage,
    is_unlocked: Boolean(u.is_unlocked),
    unlocked_at: u.unlocked_at as string | null,
    reward_description: u.reward_description as string | null,
    tier: Number(u.tier),
    ai_reasoning: u.ai_reasoning as string | null,
    created_by: String(u.created_by || 'system'),
  };
}

async function fetchPersonalProgress(userId: string, role: 'producer' | 'fan'): Promise<PersonalProgressResult> {
  if (role === 'producer') {
    // Break query chains to avoid deep type instantiation
    const beatsQuery = supabase.from('producer_beats').select('id', { count: 'exact', head: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const beatsResult = await (beatsQuery as any).eq('user_id', userId);
    
    const salesQuery = supabase.from('beat_purchases').select('id', { count: 'exact', head: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const salesResult = await (salesQuery as any).eq('seller_id', userId);
    
    const unlockQuery = supabase.from('unlockables').select('*').eq('unlock_type', 'producer');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unlockablesResult = await (unlockQuery as any).order('tier');

    const metrics: Record<string, number> = {
      beats_uploaded: beatsResult.count || 0,
      beats_sold: salesResult.count || 0,
    };

    const rawData = (unlockablesResult.data || []) as Record<string, unknown>[];
    const unlockables = rawData.map((u) => {
      const metricType = String(u.metric_type);
      const currentValue = metrics[metricType] || 0;
      return mapToUnlockable(u, currentValue);
    });

    return { metrics, unlockables };
  }

  // Fan role - break query chains
  const fanStatsQuery = supabase.from('fan_stats').select('*').eq('user_id', userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fanStatsResult = await (fanStatsQuery as any).limit(1);
  
  const day1sQuery = supabase.from('artist_day1s').select('id', { count: 'exact', head: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const day1sResult = await (day1sQuery as any).eq('fan_id', userId);
  
  const unlockQuery = supabase.from('unlockables').select('*').eq('unlock_type', 'fan');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unlockablesResult = await (unlockQuery as any).order('tier', { ascending: true });

  const fanStatsData = fanStatsResult.data?.[0] as Record<string, unknown> | undefined;
  const metrics: Record<string, number> = {
    day1_badges: day1sResult.count || 0,
    engagement_streak: Number(fanStatsData?.engagement_streak) || 0,
    artists_supported: Number(fanStatsData?.artists_supported) || 0,
    longest_streak: Number(fanStatsData?.longest_streak) || 0,
    mixxcoinz_earned: Number(fanStatsData?.mixxcoinz_earned) || 0,
  };

  const rawData = (unlockablesResult.data || []) as Record<string, unknown>[];
  const unlockables = rawData.map((u) => {
    const metricType = String(u.metric_type);
    const currentValue = metrics[metricType] || 0;
    return mapToUnlockable(u, currentValue);
  });


  return { metrics, unlockables };
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

export function useProducerUnlockables() {
  const { data, ...rest } = useUnlockables();
  return {
    data: data?.producer || [],
    platformStats: data?.platformStats,
    ...rest,
  };
}

export function useFanUnlockables() {
  const { data, ...rest } = useUnlockables();
  return {
    data: data?.fan || [],
    platformStats: data?.platformStats,
    ...rest,
  };
}

// Personal unlockables for individual user progress
export function usePersonalUnlockables(role: 'producer' | 'fan') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['personal-unlockables', user?.id, role],
    queryFn: () => fetchPersonalProgress(user!.id, role),
    enabled: !!user?.id,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

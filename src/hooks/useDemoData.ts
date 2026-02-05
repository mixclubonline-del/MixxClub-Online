import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface DemoEngineer {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  role: string;
  specialties: string[];
  hourly_rate: number;
  years_experience: number;
  genres: string[];
  rating: number;
  completed_projects: number;
  availability_status: string;
  points: number;
  level: number;
}

interface DemoSession {
  id: string;
  title: string;
  description: string;
  status: string;
  session_type: string;
  visibility: string;
  audio_quality: string;
  budget_range: string;
  genre: string;
  created_at: string;
  host: {
    name: string;
    avatar: string;
  };
}

interface DemoActivity {
  type: string;
  message: string;
  time: string;
  icon: string;
}

interface PlatformStats {
  totalEngineers: number;
  activeSession: number;
  projectsCompleted: number;
  totalEarnings: number;
}

interface DemoData {
  engineers: DemoEngineer[];
  sessions: DemoSession[];
  activity: DemoActivity[];
  stats: PlatformStats;
}

// Helper to format time ago
const formatTimeAgo = (dateStr: string): string => {
  const createdAt = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (diffHours >= 1) {
    return `${diffHours}h ago`;
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins <= 1 ? 'just now' : `${diffMins}m ago`;
  }
};

// Fetch engineers from database
const fetchEngineers = async (): Promise<DemoEngineer[]> => {
  // First get engineer profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email, bio, avatar_url, role, points, level')
    .eq('role', 'engineer')
    .order('points', { ascending: false })
    .limit(20);

  if (profilesError) {
    console.error('[useDemoData] Profiles error:', profilesError);
    return [];
  }

  if (!profiles || profiles.length === 0) return [];

  // Get engineer details for these profiles
  const profileIds = profiles.map(p => p.id);
  const { data: engineerDetails, error: detailsError } = await supabase
    .from('engineer_profiles')
    .select('user_id, hourly_rate, years_experience, specialties, genres, rating, completed_projects, availability_status')
    .in('user_id', profileIds);

  if (detailsError) {
    console.error('[useDemoData] Engineer details error:', detailsError);
  }

  const detailsMap = new Map((engineerDetails || []).map(d => [d.user_id, d]));

  return profiles.map((eng) => {
    const details = detailsMap.get(eng.id);
    return {
      id: eng.id,
      full_name: eng.full_name || 'Anonymous Engineer',
      email: eng.email || '',
      bio: eng.bio || '',
      avatar_url: eng.avatar_url || '',
      role: eng.role || 'engineer',
      specialties: (details?.specialties as string[]) || [],
      hourly_rate: details?.hourly_rate || 0,
      years_experience: details?.years_experience || 0,
      genres: (details?.genres as string[]) || [],
      rating: details?.rating || 0,
      completed_projects: details?.completed_projects || 0,
      availability_status: details?.availability_status || 'available',
      points: eng.points || 0,
      level: eng.level || 1
    };
  });
};

// Fetch sessions from database
const fetchSessions = async (): Promise<DemoSession[]> => {
  const { data: sessions, error } = await supabase
    .from('collaboration_sessions')
    .select('id, title, description, status, session_type, visibility, audio_quality, created_at, host_user_id')
    .in('status', ['active', 'scheduled', 'waiting'])
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error('[useDemoData] Sessions error:', error);
    return [];
  }

  if (!sessions || sessions.length === 0) return [];

  // Get host profiles
  const hostIds = [...new Set(sessions.map(s => s.host_user_id))];
  const { data: hosts } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', hostIds);

  const hostsMap = new Map((hosts || []).map(h => [h.id, h]));

  return sessions.map((sess) => {
    const host = hostsMap.get(sess.host_user_id);
    return {
      id: sess.id,
      title: sess.title || 'Untitled Session',
      description: sess.description || '',
      status: sess.status || 'active',
      session_type: sess.session_type || 'mixing',
      visibility: sess.visibility || 'public',
      audio_quality: sess.audio_quality || 'high',
      budget_range: '$50-$200',
      genre: 'Various',
      created_at: sess.created_at,
      host: {
        name: host?.full_name || 'Anonymous',
        avatar: host?.avatar_url || ''
      }
    };
  });
};

// Fetch activity from database
const fetchActivity = async (): Promise<DemoActivity[]> => {
  const { data: activities, error } = await supabase
    .from('activity_feed')
    .select('id, activity_type, title, description, created_at, user_id')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[useDemoData] Activity error:', error);
    return [];
  }

  if (!activities || activities.length === 0) return [];

  // Get user profiles
  const userIds = [...new Set(activities.filter(a => a.user_id).map(a => a.user_id!))];
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const usersMap = new Map((users || []).map(u => [u.id, u]));

  return activities.map((act) => {
    const user = act.user_id ? usersMap.get(act.user_id) : null;
    return {
      type: act.activity_type || 'update',
      message: `${user?.full_name || 'Someone'} ${act.title?.toLowerCase() || 'did something'}`,
      time: formatTimeAgo(act.created_at),
      icon: user?.avatar_url || ''
    };
  });
};

// Fetch platform stats from database
const fetchStats = async (): Promise<PlatformStats> => {
  try {
    // Count engineers
    const { count: engineerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'engineer');

    // Count active sessions
    const { count: activeSessionCount } = await supabase
      .from('collaboration_sessions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'scheduled', 'waiting']);

    // Sum completed projects from engineer_profiles
    const { data: projectData } = await supabase
      .from('engineer_profiles')
      .select('completed_projects');
    
    const totalProjects = (projectData || []).reduce((sum: number, ep) => 
      sum + (ep.completed_projects || 0), 0
    );

    // Sum total earnings from wallets
    const { data: walletData } = await supabase
      .from('mixx_wallets')
      .select('total_earned');
    
    const totalEarnings = (walletData || []).reduce((sum: number, w) => 
      sum + (w.total_earned || 0), 0
    );

    return {
      totalEngineers: engineerCount || 0,
      activeSession: activeSessionCount || 0,
      projectsCompleted: totalProjects,
      totalEarnings: totalEarnings
    };
  } catch (error) {
    console.error('[useDemoData] Stats error:', error);
    return {
      totalEngineers: 0,
      activeSession: 0,
      projectsCompleted: 0,
      totalEarnings: 0
    };
  }
};

// Main hook using React Query for caching
export const useDemoData = (type: 'all' | 'engineers' | 'sessions' | 'activity' | 'stats' = 'all') => {
  const shouldFetchEngineers = type === 'all' || type === 'engineers';
  const shouldFetchSessions = type === 'all' || type === 'sessions';
  const shouldFetchActivity = type === 'all' || type === 'activity';
  const shouldFetchStats = type === 'all' || type === 'stats';

  const engineersQuery = useQuery({
    queryKey: ['demo-engineers'],
    queryFn: fetchEngineers,
    enabled: shouldFetchEngineers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const sessionsQuery = useQuery({
    queryKey: ['demo-sessions'],
    queryFn: fetchSessions,
    enabled: shouldFetchSessions,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });

  const activityQuery = useQuery({
    queryKey: ['demo-activity'],
    queryFn: fetchActivity,
    enabled: shouldFetchActivity,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ['demo-stats'],
    queryFn: fetchStats,
    enabled: shouldFetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const isLoading = 
    (shouldFetchEngineers && engineersQuery.isLoading) ||
    (shouldFetchSessions && sessionsQuery.isLoading) ||
    (shouldFetchActivity && activityQuery.isLoading) ||
    (shouldFetchStats && statsQuery.isLoading);

  const error = 
    engineersQuery.error?.message ||
    sessionsQuery.error?.message ||
    activityQuery.error?.message ||
    statsQuery.error?.message ||
    null;

  const data: Partial<DemoData> = {
    ...(shouldFetchEngineers && { engineers: engineersQuery.data || [] }),
    ...(shouldFetchSessions && { sessions: sessionsQuery.data || [] }),
    ...(shouldFetchActivity && { activity: activityQuery.data || [] }),
    ...(shouldFetchStats && { stats: statsQuery.data }),
  };

  const refetch = useCallback(() => {
    if (shouldFetchEngineers) engineersQuery.refetch();
    if (shouldFetchSessions) sessionsQuery.refetch();
    if (shouldFetchActivity) activityQuery.refetch();
    if (shouldFetchStats) statsQuery.refetch();
  }, [shouldFetchEngineers, shouldFetchSessions, shouldFetchActivity, shouldFetchStats, engineersQuery, sessionsQuery, activityQuery, statsQuery]);

  return { data, isLoading, error, refetch };
};

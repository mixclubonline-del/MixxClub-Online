import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EngineerEarnings {
  id: string;
  project_id: string | null;
  base_amount: number;
  bonus_amount: number;
  total_amount: number;
  status: string;
  payout_date: string | null;
  created_at: string;
}

interface EngineerStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  completedProjects: number;
  activeProjects: number;
  averageRating: number;
  totalBonuses: number;
}

interface EngineerBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  icon_name: string | null;
  earned_at: string;
}

interface EngineerStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export function useEngineerEarnings(engineerId: string | undefined) {
  const [earnings, setEarnings] = useState<EngineerEarnings[]>([]);
  const [stats, setStats] = useState<EngineerStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    completedProjects: 0,
    activeProjects: 0,
    averageRating: 0,
    totalBonuses: 0,
  });
  const [badges, setBadges] = useState<EngineerBadge[]>([]);
  const [streak, setStreak] = useState<EngineerStreak>({
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!engineerId) {
      setLoading(false);
      return;
    }

    fetchEngineerData();

    // Set up real-time subscription for earnings
    const earningsChannel = supabase
      .channel('engineer-earnings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'engineer_earnings',
          filter: `engineer_id=eq.${engineerId}`,
        },
        () => {
          fetchEngineerData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(earningsChannel);
    };
  }, [engineerId]);

  const fetchEngineerData = async () => {
    if (!engineerId) return;

    try {
      // Fetch earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('engineer_earnings')
        .select('*')
        .eq('engineer_id', engineerId)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Fetch projects for stats
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*, project_reviews(rating)')
        .eq('engineer_id', engineerId);

      if (projectsError) throw projectsError;

      // Calculate stats
      const paidEarnings = earningsData
        ?.filter((e) => e.status === 'paid')
        .reduce((sum, e) => sum + Number(e.total_amount), 0) || 0;

      const pendingEarnings = earningsData
        ?.filter((e) => e.status === 'pending')
        .reduce((sum, e) => sum + Number(e.total_amount), 0) || 0;

      const totalBonuses = earningsData
        ?.reduce((sum, e) => sum + Number(e.bonus_amount || 0), 0) || 0;

      const completedProjects = projectsData?.filter(
        (p) => p.status === 'completed'
      ).length || 0;

      const activeProjects = projectsData?.filter(
        (p) => p.status === 'in_progress'
      ).length || 0;

      // Calculate average rating
      const ratings = projectsData?.flatMap((p: any) =>
        p.project_reviews?.map((r: any) => r.rating)
      ).filter((r: number) => r != null) || [];

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
          : 0;

      setStats({
        totalEarnings: paidEarnings + pendingEarnings,
        pendingEarnings,
        paidEarnings,
        completedProjects,
        activeProjects,
        averageRating,
        totalBonuses,
      });

      // Fetch badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('engineer_badges')
        .select('*')
        .eq('engineer_id', engineerId)
        .order('earned_at', { ascending: false });

      if (badgesError) throw badgesError;
      setBadges(badgesData || []);

      // Fetch streak
      const { data: streakData, error: streakError } = await supabase
        .from('engineer_streaks')
        .select('*')
        .eq('user_id', engineerId)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        // Ignore "no rows" error
        throw streakError;
      }

      if (streakData) {
        setStreak({
          current_streak: streakData.current_streak || 0,
          longest_streak: streakData.longest_streak || 0,
          last_activity_date: streakData.last_session_date || streakData.last_activity_date || null,
        });
      }
    } catch (error: any) {
      console.error('Error fetching engineer data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load engineer data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    earnings,
    stats,
    badges,
    streak,
    loading,
    refetch: fetchEngineerData,
  };
}

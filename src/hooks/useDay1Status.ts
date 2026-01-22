import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type RecognitionTier = 'before_day1' | 'day1' | 'early_supporter' | 'supporter';

export interface Day1Record {
  id: string;
  fan_id: string;
  artist_id: string;
  followed_at: string;
  artist_follower_count_at_follow: number;
  puttin_in_at_time: number;
  recognition_tier: RecognitionTier;
  artist_milestone_1k: boolean;
  artist_milestone_10k: boolean;
  artist_milestone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Day1WithArtist extends Day1Record {
  artist?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    follower_count: number | null;
  };
}

export interface Day1Stats {
  totalArtistsSupported: number;
  day1Count: number;
  beforeDay1Count: number;
  earlySupporterCount: number;
  artistsHit1k: number;
  artistsHit10k: number;
  discoveryScore: number;
}

const TIER_LABELS: Record<RecognitionTier, string> = {
  before_day1: 'Before Day 1',
  day1: 'Day 1',
  early_supporter: 'Early Supporter',
  supporter: 'Supporter',
};

const TIER_ICONS: Record<RecognitionTier, string> = {
  before_day1: '🌟',
  day1: '⭐',
  early_supporter: '💫',
  supporter: '✨',
};

const TIER_COLORS: Record<RecognitionTier, string> = {
  before_day1: 'text-amber-400',
  day1: 'text-yellow-400',
  early_supporter: 'text-blue-400',
  supporter: 'text-muted-foreground',
};

export function calculateRecognitionTier(followerCount: number): RecognitionTier {
  if (followerCount < 10) return 'before_day1';
  if (followerCount < 100) return 'day1';
  if (followerCount < 1000) return 'early_supporter';
  return 'supporter';
}

export function getTierLabel(tier: RecognitionTier): string {
  return TIER_LABELS[tier];
}

export function getTierIcon(tier: RecognitionTier): string {
  return TIER_ICONS[tier];
}

export function getTierColor(tier: RecognitionTier): string {
  return TIER_COLORS[tier];
}

export function useDay1Status(artistId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check Day 1 status for a specific artist
  const {
    data: day1Record,
    isLoading: isCheckingDay1,
  } = useQuery({
    queryKey: ['day1-status', user?.id, artistId],
    queryFn: async () => {
      if (!user?.id || !artistId) return null;
      
      const { data, error } = await supabase
        .from('artist_day1s')
        .select('*')
        .eq('fan_id', user.id)
        .eq('artist_id', artistId)
        .maybeSingle();

      if (error) {
        console.error('Error checking Day 1 status:', error);
        return null;
      }

      return data as Day1Record | null;
    },
    enabled: !!user?.id && !!artistId,
  });

  // Get all Day 1 records for current user
  const {
    data: myDay1Artists,
    isLoading: isLoadingMyArtists,
  } = useQuery({
    queryKey: ['my-day1-artists', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('artist_day1s')
        .select(`
          *,
          artist:profiles!artist_day1s_artist_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            follower_count
          )
        `)
        .eq('fan_id', user.id)
        .order('followed_at', { ascending: false });

      if (error) {
        console.error('Error fetching Day 1 artists:', error);
        return [];
      }

      return data as Day1WithArtist[];
    },
    enabled: !!user?.id,
  });

  // Get Day 1s for a specific artist (as the artist)
  const {
    data: artistDay1s,
    isLoading: isLoadingArtistDay1s,
  } = useQuery({
    queryKey: ['artist-day1s', artistId],
    queryFn: async () => {
      if (!artistId) return [];
      
      const { data, error } = await supabase
        .from('artist_day1s')
        .select(`
          *,
          fan:profiles!artist_day1s_fan_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('artist_id', artistId)
        .order('artist_follower_count_at_follow', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching artist Day 1s:', error);
        return [];
      }

      return data;
    },
    enabled: !!artistId,
  });

  // Calculate stats for fan profile
  const stats: Day1Stats = {
    totalArtistsSupported: myDay1Artists?.length ?? 0,
    day1Count: myDay1Artists?.filter(d => d.recognition_tier === 'day1').length ?? 0,
    beforeDay1Count: myDay1Artists?.filter(d => d.recognition_tier === 'before_day1').length ?? 0,
    earlySupporterCount: myDay1Artists?.filter(d => d.recognition_tier === 'early_supporter').length ?? 0,
    artistsHit1k: myDay1Artists?.filter(d => d.artist_milestone_1k).length ?? 0,
    artistsHit10k: myDay1Artists?.filter(d => d.artist_milestone_10k).length ?? 0,
    discoveryScore: calculateDiscoveryScore(myDay1Artists ?? []),
  };

  // Get follower rank (what number follower you would be)
  const getFollowerRank = useCallback((record: Day1Record | null) => {
    if (!record) return null;
    return record.artist_follower_count_at_follow + 1;
  }, []);

  const isDay1 = day1Record?.recognition_tier === 'day1' || day1Record?.recognition_tier === 'before_day1';
  const followerRank = getFollowerRank(day1Record);

  return {
    // Single artist checks
    day1Record,
    isDay1,
    isCheckingDay1,
    followerRank,
    recognitionTier: day1Record?.recognition_tier ?? null,
    
    // Fan's Day 1 collection
    myDay1Artists,
    isLoadingMyArtists,
    stats,
    
    // Artist's Day 1 fans
    artistDay1s,
    isLoadingArtistDay1s,
    
    // Helpers
    getTierLabel,
    getTierIcon,
    getTierColor,
  };
}

function calculateDiscoveryScore(day1s: Day1WithArtist[]): number {
  if (day1s.length === 0) return 0;
  
  let score = 0;
  
  for (const d of day1s) {
    // Points based on how early you found them
    if (d.recognition_tier === 'before_day1') score += 10;
    else if (d.recognition_tier === 'day1') score += 5;
    else if (d.recognition_tier === 'early_supporter') score += 2;
    
    // Bonus points for successful picks
    if (d.artist_milestone_1k) score += 15;
    if (d.artist_milestone_10k) score += 30;
    if (d.artist_milestone_verified) score += 50;
  }
  
  return score;
}

// Hook to get potential follower rank before following
export function usePotentialDay1(artistId: string) {
  const { data: artistProfile, isLoading } = useQuery({
    queryKey: ['artist-profile-followers', artistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('follower_count')
        .eq('id', artistId)
        .single();

      if (error) {
        console.error('Error fetching artist profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!artistId,
  });

  const followerCount = artistProfile?.follower_count ?? 0;
  const potentialRank = followerCount + 1;
  const potentialTier = calculateRecognitionTier(followerCount);

  return {
    isLoading,
    followerCount,
    potentialRank,
    potentialTier,
    isDay1Opportunity: potentialTier === 'before_day1' || potentialTier === 'day1',
  };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { BeatRoyalty, RoyaltySummary, RecordRoyaltyInput, StreamingPlatform } from '@/types/producer-partnership';

interface UseBeatRoyaltiesResult {
  royalties: BeatRoyalty[];
  summary: RoyaltySummary | null;
  loading: boolean;
  error: string | null;
  fetchRoyalties: (partnershipId?: string) => Promise<void>;
  recordRoyalty: (data: RecordRoyaltyInput) => Promise<BeatRoyalty | null>;
  markRoyaltyPaid: (royaltyId: string) => Promise<boolean>;
  calculateSummary: () => void;
}

export const useBeatRoyalties = (): UseBeatRoyaltiesResult => {
  const { user } = useAuth();
  const [royalties, setRoyalties] = useState<BeatRoyalty[]>([]);
  const [summary, setSummary] = useState<RoyaltySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoyalties = useCallback(async (partnershipId?: string) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('beat_royalties')
        .select(`
          *,
          track_release:track_releases(id, track_title, cover_art_url, total_streams),
          partnership:partnerships(
            id,
            producer_id,
            artist_id,
            producer:profiles!partnerships_producer_id_fkey(id, full_name),
            artist:profiles!partnerships_artist_id_fkey(id, full_name)
          )
        `)
        .order('period_end', { ascending: false });

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const typed = (data || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        partnership_id: r.partnership_id as string,
        track_release_id: r.track_release_id as string | undefined,
        beat_id: r.beat_id as string | undefined,
        period_start: r.period_start as string,
        period_end: r.period_end as string,
        platform: r.platform as StreamingPlatform | undefined,
        stream_count: (r.stream_count as number) || 0,
        gross_revenue: (r.gross_revenue as number) || 0,
        producer_amount: (r.producer_amount as number) || 0,
        artist_amount: (r.artist_amount as number) || 0,
        platform_fee: (r.platform_fee as number) || 0,
        producer_percentage: (r.producer_percentage as number) || 50,
        artist_percentage: (r.artist_percentage as number) || 50,
        status: r.status as BeatRoyalty['status'],
        paid_at: r.paid_at as string | undefined,
        created_at: r.created_at as string,
        track_release: r.track_release as BeatRoyalty['track_release'],
        partnership: r.partnership as BeatRoyalty['partnership'],
      }));

      setRoyalties(typed);
    } catch (err) {
      console.error('Error fetching royalties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch royalties');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const recordRoyalty = useCallback(async (data: RecordRoyaltyInput): Promise<BeatRoyalty | null> => {
    if (!user?.id) return null;

    try {
      // Get partnership to calculate split
      const { data: partnership, error: partnershipError } = await supabase
        .from('partnerships')
        .select('producer_percentage, artist_percentage')
        .eq('id', data.partnership_id)
        .single();

      if (partnershipError) throw partnershipError;

      const producerPercentage = partnership.producer_percentage || 50;
      const artistPercentage = partnership.artist_percentage || 50;
      const producerAmount = (data.gross_revenue * producerPercentage) / 100;
      const artistAmount = (data.gross_revenue * artistPercentage) / 100;

      const { data: newRoyalty, error: createError } = await supabase
        .from('beat_royalties')
        .insert({
          partnership_id: data.partnership_id,
          track_release_id: data.track_release_id,
          beat_id: data.beat_id,
          period_start: data.period_start,
          period_end: data.period_end,
          platform: data.platform,
          stream_count: data.stream_count || 0,
          gross_revenue: data.gross_revenue,
          producer_amount: producerAmount,
          artist_amount: artistAmount,
          producer_percentage: producerPercentage,
          artist_percentage: artistPercentage,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchRoyalties();
      return newRoyalty as BeatRoyalty;
    } catch (err) {
      console.error('Error recording royalty:', err);
      setError(err instanceof Error ? err.message : 'Failed to record royalty');
      return null;
    }
  }, [user?.id, fetchRoyalties]);

  const markRoyaltyPaid = useCallback(async (royaltyId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('beat_royalties')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', royaltyId);

      if (updateError) throw updateError;

      await fetchRoyalties();
      return true;
    } catch (err) {
      console.error('Error marking royalty as paid:', err);
      setError(err instanceof Error ? err.message : 'Failed to update royalty');
      return false;
    }
  }, [fetchRoyalties]);

  const calculateSummary = useCallback(() => {
    if (!royalties.length) {
      setSummary(null);
      return;
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalRoyalties = royalties.reduce((sum, r) => {
      // Add user's share based on their role
      return sum + r.producer_amount + r.artist_amount;
    }, 0);

    const thisMonthRoyalties = royalties
      .filter(r => new Date(r.period_end) >= thisMonthStart)
      .reduce((sum, r) => sum + r.gross_revenue, 0);

    const lastMonthRoyalties = royalties
      .filter(r => {
        const periodEnd = new Date(r.period_end);
        return periodEnd >= lastMonthStart && periodEnd <= lastMonthEnd;
      })
      .reduce((sum, r) => sum + r.gross_revenue, 0);

    const pendingPayouts = royalties
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.gross_revenue, 0);

    const totalStreams = royalties.reduce((sum, r) => sum + r.stream_count, 0);

    // Group by platform
    const platformGroups = royalties.reduce((acc, r) => {
      const platform = r.platform || 'other';
      if (!acc[platform]) {
        acc[platform] = { amount: 0, streams: 0 };
      }
      acc[platform].amount += r.gross_revenue;
      acc[platform].streams += r.stream_count;
      return acc;
    }, {} as Record<string, { amount: number; streams: number }>);

    const royaltiesByPlatform = Object.entries(platformGroups).map(([platform, data]) => ({
      platform: platform as StreamingPlatform,
      amount: data.amount,
      streams: data.streams,
    }));

    // Monthly trend (last 6 months)
    const monthlyTrend: RoyaltySummary['monthlyTrend'] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const monthData = royalties.filter(r => {
        const periodEnd = new Date(r.period_end);
        return periodEnd >= monthStart && periodEnd <= monthEnd;
      });

      monthlyTrend.push({
        month: monthName,
        revenue: monthData.reduce((sum, r) => sum + r.gross_revenue, 0),
        streams: monthData.reduce((sum, r) => sum + r.stream_count, 0),
      });
    }

    setSummary({
      totalRoyalties,
      thisMonthRoyalties,
      lastMonthRoyalties,
      pendingPayouts,
      totalStreams,
      topPerformingTracks: [], // Would need track_releases join
      royaltiesByPlatform,
      monthlyTrend,
    });
  }, [royalties]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchRoyalties();
    }
  }, [user?.id, fetchRoyalties]);

  // Calculate summary when royalties change
  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  return {
    royalties,
    summary,
    loading,
    error,
    fetchRoyalties,
    recordRoyalty,
    markRoyaltyPaid,
    calculateSummary,
  };
};

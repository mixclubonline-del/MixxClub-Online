/**
 * useProducerPartnerships — CRUD for producer-specific partnerships,
 * including pending requests and active collaborations.
 *
 * Collaboration limit guard: createPartnership checks canUseFeature('collaborations')
 * before inserting and calls refreshUsage() on success.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUsageEnforcement } from './useUsageEnforcement';
import { toast } from 'sonner';
import type { ProducerPartnership, CreateProducerPartnershipInput } from '@/types/producer-partnership';

interface UseProducerPartnershipsResult {
  partnerships: ProducerPartnership[];
  pendingRequests: ProducerPartnership[];
  activeCollabs: ProducerPartnership[];
  loading: boolean;
  error: string | null;
  fetchPartnerships: () => Promise<void>;
  createPartnership: (data: CreateProducerPartnershipInput) => Promise<ProducerPartnership | null>;
  acceptPartnership: (partnershipId: string) => Promise<boolean>;
  declinePartnership: (partnershipId: string) => Promise<boolean>;
  updateSplit: (partnershipId: string, producerPercentage: number) => Promise<boolean>;
}

export const useProducerPartnerships = (): UseProducerPartnershipsResult => {
  const { user } = useAuth();
  const { canUseFeature, getFeatureUsage, refreshUsage, tier } = useUsageEnforcement();
  const [partnerships, setPartnerships] = useState<ProducerPartnership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerships = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('partnerships')
        .select(`
          *,
          producer:profiles!partnerships_producer_id_fkey(id, full_name, avatar_url, username),
          artist:profiles!partnerships_artist_id_fkey(id, full_name, avatar_url, username),
          beat:producer_beats(id, title, cover_art_url, audio_url)
        `)
        .eq('partnership_type', 'producer_artist')
        .or(`producer_id.eq.${user.id},artist_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const typed = (data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        producer_id: p.producer_id as string,
        artist_id: p.artist_id as string,
        beat_id: p.beat_id as string | undefined,
        partnership_type: 'producer_artist' as const,
        status: p.status as ProducerPartnership['status'],
        producer_percentage: (p.producer_percentage as number) || 50,
        artist_percentage: 100 - ((p.producer_percentage as number) || 50),
        total_revenue: (p.total_revenue as number) || 0,
        producer_earnings: (p.producer_earnings as number) || 0,
        artist_earnings: (p.artist_earnings as number) || 0,
        created_at: p.created_at as string,
        accepted_at: p.accepted_at as string | undefined,
        notes: p.notes as string | undefined,
        producer: p.producer as ProducerPartnership['producer'],
        artist: p.artist as ProducerPartnership['artist'],
        beat: p.beat as ProducerPartnership['beat'],
      }));

      setPartnerships(typed);
    } catch (err) {
      console.error('Error fetching producer partnerships:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch partnerships');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createPartnership = useCallback(async (data: CreateProducerPartnershipInput): Promise<ProducerPartnership | null> => {
    if (!user?.id) return null;

    if (!canUseFeature('collaborations')) {
      const usage = getFeatureUsage('collaborations');
      toast.error(`Collaboration limit reached (${usage.current}/${usage.limit}) on your ${tier} plan. Upgrade for more.`, {
        action: { label: 'Upgrade', onClick: () => window.location.href = '/pricing?feature=collaborations' },
      });
      return null;
    }

    try {
      const artistPercentage = 100 - data.producer_percentage;

      const { data: newPartnership, error: createError } = await supabase
        .from('partnerships')
        .insert({
          producer_id: user.id,
          artist_id: data.artist_id,
          beat_id: data.beat_id,
          partnership_type: 'producer_artist',
          producer_percentage: data.producer_percentage,
          artist_percentage: artistPercentage,
          status: 'proposed',
          notes: data.notes,
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchPartnerships();
      await refreshUsage();
      return {
        ...newPartnership,
        partnership_type: 'producer_artist',
        artist_percentage: artistPercentage,
        total_revenue: 0,
        producer_earnings: 0,
        artist_earnings: 0,
      } as ProducerPartnership;
    } catch (err) {
      console.error('Error creating producer partnership:', err);
      setError(err instanceof Error ? err.message : 'Failed to create partnership');
      return null;
    }
  }, [user?.id, fetchPartnerships, canUseFeature, getFeatureUsage, refreshUsage, tier]);

  const acceptPartnership = useCallback(async (partnershipId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('partnerships')
        .update({
          status: 'active',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', partnershipId);

      if (updateError) throw updateError;

      await fetchPartnerships();
      return true;
    } catch (err) {
      console.error('Error accepting partnership:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept partnership');
      return false;
    }
  }, [fetchPartnerships]);

  const declinePartnership = useCallback(async (partnershipId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('partnerships')
        .update({ status: 'dissolved' })
        .eq('id', partnershipId);

      if (updateError) throw updateError;

      await fetchPartnerships();
      return true;
    } catch (err) {
      console.error('Error declining partnership:', err);
      setError(err instanceof Error ? err.message : 'Failed to decline partnership');
      return false;
    }
  }, [fetchPartnerships]);

  const updateSplit = useCallback(async (partnershipId: string, producerPercentage: number): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('partnerships')
        .update({
          producer_percentage: producerPercentage,
          artist_percentage: 100 - producerPercentage,
        })
        .eq('id', partnershipId);

      if (updateError) throw updateError;

      await fetchPartnerships();
      return true;
    } catch (err) {
      console.error('Error updating split:', err);
      setError(err instanceof Error ? err.message : 'Failed to update split');
      return false;
    }
  }, [fetchPartnerships]);

  // Filter by status
  const pendingRequests = partnerships.filter(p => 
    p.status === 'proposed' || p.status === 'negotiating'
  );
  
  const activeCollabs = partnerships.filter(p => 
    p.status === 'active' || p.status === 'accepted'
  );

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchPartnerships();
    }
  }, [user?.id, fetchPartnerships]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('producer-partnerships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partnerships',
          filter: `partnership_type=eq.producer_artist`,
        },
        () => {
          fetchPartnerships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchPartnerships]);

  return {
    partnerships,
    pendingRequests,
    activeCollabs,
    loading,
    error,
    fetchPartnerships,
    createPartnership,
    acceptPartnership,
    declinePartnership,
    updateSplit,
  };
};

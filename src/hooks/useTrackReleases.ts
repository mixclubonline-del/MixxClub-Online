import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { TrackRelease, CreateTrackReleaseInput } from '@/types/producer-partnership';

interface UseTrackReleasesResult {
  releases: TrackRelease[];
  loading: boolean;
  error: string | null;
  fetchReleases: (partnershipId?: string) => Promise<void>;
  createRelease: (data: CreateTrackReleaseInput) => Promise<TrackRelease | null>;
  updateRelease: (id: string, data: Partial<CreateTrackReleaseInput>) => Promise<boolean>;
  linkStreamingPlatform: (releaseId: string, platform: string, url: string) => Promise<boolean>;
  updateStreamStats: (releaseId: string, streams: number, revenue: number) => Promise<boolean>;
}

export const useTrackReleases = (): UseTrackReleasesResult => {
  const { user } = useAuth();
  const [releases, setReleases] = useState<TrackRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = useCallback(async (partnershipId?: string) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('track_releases')
        .select(`
          *,
          beat:producer_beats(id, title, cover_art_url),
          partnership:partnerships(
            id,
            producer_id,
            artist_id,
            producer_percentage,
            producer:profiles!partnerships_producer_id_fkey(id, full_name, avatar_url),
            artist:profiles!partnerships_artist_id_fkey(id, full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const typed = (data || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        partnership_id: r.partnership_id as string,
        beat_id: r.beat_id as string | undefined,
        track_title: r.track_title as string,
        artist_name: r.artist_name as string | undefined,
        release_date: r.release_date as string | undefined,
        streaming_platforms: (r.streaming_platforms as Record<string, string>) || {},
        isrc_code: r.isrc_code as string | undefined,
        upc_code: r.upc_code as string | undefined,
        cover_art_url: r.cover_art_url as string | undefined,
        status: r.status as TrackRelease['status'],
        total_streams: (r.total_streams as number) || 0,
        total_revenue: (r.total_revenue as number) || 0,
        created_at: r.created_at as string,
        updated_at: r.updated_at as string,
        beat: r.beat as TrackRelease['beat'],
        partnership: r.partnership as TrackRelease['partnership'],
      }));

      setReleases(typed);
    } catch (err) {
      console.error('Error fetching track releases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch releases');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createRelease = useCallback(async (data: CreateTrackReleaseInput): Promise<TrackRelease | null> => {
    if (!user?.id) return null;

    try {
      const { data: newRelease, error: createError } = await supabase
        .from('track_releases')
        .insert({
          partnership_id: data.partnership_id,
          beat_id: data.beat_id,
          track_title: data.track_title,
          artist_name: data.artist_name,
          release_date: data.release_date,
          streaming_platforms: data.streaming_platforms || {},
          isrc_code: data.isrc_code,
          upc_code: data.upc_code,
          cover_art_url: data.cover_art_url,
          status: data.status || 'unreleased',
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchReleases();
      return newRelease as TrackRelease;
    } catch (err) {
      console.error('Error creating track release:', err);
      setError(err instanceof Error ? err.message : 'Failed to create release');
      return null;
    }
  }, [user?.id, fetchReleases]);

  const updateRelease = useCallback(async (id: string, data: Partial<CreateTrackReleaseInput>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('track_releases')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchReleases();
      return true;
    } catch (err) {
      console.error('Error updating track release:', err);
      setError(err instanceof Error ? err.message : 'Failed to update release');
      return false;
    }
  }, [fetchReleases]);

  const linkStreamingPlatform = useCallback(async (releaseId: string, platform: string, url: string): Promise<boolean> => {
    try {
      // Fetch current platforms
      const { data: release, error: fetchError } = await supabase
        .from('track_releases')
        .select('streaming_platforms')
        .eq('id', releaseId)
        .single();

      if (fetchError) throw fetchError;

      const currentPlatforms = (release?.streaming_platforms as Record<string, string>) || {};
      const updatedPlatforms = { ...currentPlatforms, [platform]: url };

      const { error: updateError } = await supabase
        .from('track_releases')
        .update({ streaming_platforms: updatedPlatforms })
        .eq('id', releaseId);

      if (updateError) throw updateError;

      await fetchReleases();
      return true;
    } catch (err) {
      console.error('Error linking streaming platform:', err);
      setError(err instanceof Error ? err.message : 'Failed to link platform');
      return false;
    }
  }, [fetchReleases]);

  const updateStreamStats = useCallback(async (releaseId: string, streams: number, revenue: number): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('track_releases')
        .update({
          total_streams: streams,
          total_revenue: revenue,
        })
        .eq('id', releaseId);

      if (updateError) throw updateError;

      await fetchReleases();
      return true;
    } catch (err) {
      console.error('Error updating stream stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to update stats');
      return false;
    }
  }, [fetchReleases]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchReleases();
    }
  }, [user?.id, fetchReleases]);

  return {
    releases,
    loading,
    error,
    fetchReleases,
    createRelease,
    updateRelease,
    linkStreamingPlatform,
    updateStreamStats,
  };
};

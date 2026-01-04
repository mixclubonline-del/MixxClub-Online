import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UserTrack {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  audio_url: string;
  artwork_url?: string;
  duration_seconds?: number;
  genre?: string;
  bpm?: number;
  key_signature?: string;
  is_public: boolean;
  is_for_sale: boolean;
  price?: number;
  license_type: string;
  play_count: number;
  download_count: number;
  collaboration_credits: Array<{ name: string; role: string; user_id?: string }>;
  source_project_id?: string;
  source_premiere_id?: string;
  release_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTrackInput {
  title: string;
  description?: string;
  audio_url: string;
  artwork_url?: string;
  duration_seconds?: number;
  genre?: string;
  bpm?: number;
  key_signature?: string;
  is_public?: boolean;
  is_for_sale?: boolean;
  price?: number;
  license_type?: string;
  collaboration_credits?: Array<{ name: string; role: string; user_id?: string }>;
  source_project_id?: string;
  source_premiere_id?: string;
  release_date?: string;
}

export const useMusicCatalogue = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const {
    data: tracks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-tracks', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('user_tracks')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserTrack[];
    },
    enabled: !!targetUserId,
  });

  const addTrackMutation = useMutation({
    mutationFn: async (input: CreateTrackInput) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('user_tracks')
        .insert({
          ...input,
          user_id: user.id,
          collaboration_credits: input.collaboration_credits || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tracks'] });
      toast.success('Track added to your catalogue!');
    },
    onError: (error) => {
      toast.error('Failed to add track: ' + error.message);
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserTrack> & { id: string }) => {
      const { data, error } = await supabase
        .from('user_tracks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tracks'] });
      toast.success('Track updated!');
    },
    onError: (error) => {
      toast.error('Failed to update track: ' + error.message);
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const { error } = await supabase
        .from('user_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tracks'] });
      toast.success('Track removed from catalogue');
    },
    onError: (error) => {
      toast.error('Failed to delete track: ' + error.message);
    },
  });

  const incrementPlayCount = useMutation({
    mutationFn: async (trackId: string) => {
      // Increment play count directly
      const currentTrack = tracks.find(t => t.id === trackId);
      const newCount = (currentTrack?.play_count || 0) + 1;
      const { error: updateError } = await supabase
        .from('user_tracks')
        .update({ play_count: newCount })
        .eq('id', trackId);
      if (updateError) throw updateError;
    },
  });

  const publicTracks = tracks.filter(t => t.is_public);
  const privateTracks = tracks.filter(t => !t.is_public);
  const forSaleTracks = tracks.filter(t => t.is_for_sale);

  return {
    tracks,
    publicTracks,
    privateTracks,
    forSaleTracks,
    isLoading,
    error,
    refetch,
    addTrack: addTrackMutation.mutate,
    updateTrack: updateTrackMutation.mutate,
    deleteTrack: deleteTrackMutation.mutate,
    incrementPlayCount: incrementPlayCount.mutate,
    isAddingTrack: addTrackMutation.isPending,
    isUpdatingTrack: updateTrackMutation.isPending,
    isDeletingTrack: deleteTrackMutation.isPending,
  };
};

// Hook for discovering new public tracks across the platform
export const useDiscoverTracks = (options?: {
  genre?: string;
  limit?: number;
  sortBy?: 'recent' | 'popular';
}) => {
  const { genre, limit = 20, sortBy = 'recent' } = options || {};

  return useQuery({
    queryKey: ['discover-tracks', genre, limit, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('user_tracks')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .limit(limit);

      if (genre) {
        query = query.eq('genre', genre);
      }

      if (sortBy === 'popular') {
        query = query.order('play_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

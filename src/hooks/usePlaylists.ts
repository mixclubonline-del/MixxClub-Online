import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UserTrack } from './useMusicCatalogue';

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_url?: string;
  is_public: boolean;
  is_collaborative: boolean;
  track_count: number;
  total_duration: number;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistTrackData {
  id: string;
  playlist_id: string;
  track_id: string;
  position: number;
  added_by?: string;
  added_at: string;
  track?: UserTrack;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  cover_url?: string;
  is_public?: boolean;
  is_collaborative?: boolean;
}

export const usePlaylists = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: playlists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Playlist[];
    },
    enabled: !!user?.id,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (input: CreatePlaylistInput) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('playlists')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Playlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist created!');
    },
    onError: (error) => {
      toast.error('Failed to create playlist: ' + error.message);
    },
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Playlist> & { id: string }) => {
      const { data, error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist updated!');
    },
    onError: (error) => {
      toast.error('Failed to update playlist: ' + error.message);
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete playlist: ' + error.message);
    },
  });

  return {
    playlists,
    isLoading,
    error,
    refetch,
    createPlaylist: createPlaylistMutation.mutateAsync,
    updatePlaylist: updatePlaylistMutation.mutate,
    deletePlaylist: deletePlaylistMutation.mutate,
    isCreating: createPlaylistMutation.isPending,
    isUpdating: updatePlaylistMutation.isPending,
    isDeleting: deletePlaylistMutation.isPending,
  };
};

export const usePlaylistTracks = (playlistId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: tracks = [],
    isLoading,
    error,
  } = useQuery<any[]>({
    queryKey: ['playlist-tracks', playlistId],
    queryFn: async () => {
      if (!playlistId) return [];

      const { data, error } = await supabase
        .from('playlist_tracks')
        .select(`
          *,
          track:user_tracks (
            *
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!playlistId,
  });

  const addTrackMutation = useMutation({
    mutationFn: async ({ playlistId, trackId }: { playlistId: string; trackId: string }) => {
      if (!user?.id) throw new Error('Must be logged in');

      // Get current max position
      const { data: existing } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: trackId,
          position: nextPosition,
          added_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update playlist track count
      await supabase
        .from('playlists')
        .update({ 
          track_count: nextPosition + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-tracks'] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Track added to playlist!');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Track already in playlist');
      } else {
        toast.error('Failed to add track: ' + error.message);
      }
    },
  });

  const removeTrackMutation = useMutation({
    mutationFn: async ({ playlistId, trackId }: { playlistId: string; trackId: string }) => {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-tracks'] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Track removed from playlist');
    },
    onError: (error) => {
      toast.error('Failed to remove track: ' + error.message);
    },
  });

  const reorderTracksMutation = useMutation({
    mutationFn: async (newOrder: { id: string; position: number }[]) => {
      const updates = newOrder.map(({ id, position }) =>
        supabase
          .from('playlist_tracks')
          .update({ position })
          .eq('id', id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-tracks'] });
    },
  });

  return {
    tracks,
    isLoading,
    error,
    addTrack: addTrackMutation.mutate,
    removeTrack: removeTrackMutation.mutate,
    reorderTracks: reorderTracksMutation.mutate,
    isAdding: addTrackMutation.isPending,
    isRemoving: removeTrackMutation.isPending,
  };
};

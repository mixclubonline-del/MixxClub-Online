/**
 * useExportedTracks - Query and mutation hooks for managing exported tracks
 * 
 * Handles fetching user's exported tracks, creating new export records,
 * and uploading audio files to cloud storage.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ExportedTrack {
  id: string;
  user_id: string;
  title: string;
  artist_name: string | null;
  genre: string | null;
  bpm: number | null;
  duration_seconds: number | null;
  file_path: string;
  file_size_bytes: number | null;
  format: string;
  bit_depth: number;
  sample_rate: number;
  velvet_curve_preset: string | null;
  created_at: string;
  distributed_at: string | null;
  distribution_partner: string | null;
}

export interface CreateExportInput {
  title: string;
  artistName?: string;
  genre?: string;
  bpm?: number;
  durationSeconds: number;
  bitDepth: 16 | 24 | 32;
  sampleRate?: number;
  velvetCurvePreset?: string;
  audioBlob: Blob;
}

/**
 * Fetch user's exported tracks
 */
export function useExportedTracks() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exported-tracks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('exported_tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExportedTrack[];
    },
    enabled: !!user?.id
  });
}

/**
 * Create a new exported track record with cloud upload
 */
export function useCreateExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateExportInput): Promise<ExportedTrack> => {
      if (!user?.id) {
        throw new Error('Must be logged in to export');
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${input.title.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.wav`;
      const storagePath = `${user.id}/${filename}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('exported-tracks')
        .upload(storagePath, input.audioBlob, {
          contentType: 'audio/wav',
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('[useCreateExport] Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Create database record
      const { data, error } = await supabase
        .from('exported_tracks')
        .insert({
          user_id: user.id,
          title: input.title,
          artist_name: input.artistName || null,
          genre: input.genre || null,
          bpm: input.bpm || null,
          duration_seconds: input.durationSeconds,
          file_path: storagePath,
          file_size_bytes: input.audioBlob.size,
          format: 'wav',
          bit_depth: input.bitDepth,
          sample_rate: input.sampleRate || 48000,
          velvet_curve_preset: input.velvetCurvePreset || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('[useCreateExport] Database error:', error);
        // Try to clean up uploaded file
        await supabase.storage.from('exported-tracks').remove([storagePath]);
        throw new Error(`Failed to save export: ${error.message}`);
      }
      
      return data as ExportedTrack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exported-tracks'] });
      toast({
        title: "Saved to Cloud",
        description: "Your export is ready for distribution"
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  });
}

/**
 * Update export with distribution info
 */
export function useMarkAsDistributed() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ trackId, partner }: { trackId: string; partner: string }) => {
      const { error } = await supabase
        .from('exported_tracks')
        .update({
          distributed_at: new Date().toISOString(),
          distribution_partner: partner
        })
        .eq('id', trackId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exported-tracks'] });
      toast({
        title: "Distribution Started",
        description: "Track marked as distributed"
      });
    }
  });
}

/**
 * Get signed URL for playback
 */
export async function getExportPlaybackUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('exported-tracks')
    .createSignedUrl(filePath, 3600); // 1 hour expiry
  
  if (error) {
    console.error('[getExportPlaybackUrl] Error:', error);
    return null;
  }
  
  return data.signedUrl;
}

/**
 * Delete an exported track
 */
export function useDeleteExport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (track: ExportedTrack) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('exported-tracks')
        .remove([track.file_path]);
      
      if (storageError) {
        console.warn('[useDeleteExport] Storage cleanup warning:', storageError);
      }
      
      // Delete from database
      const { error } = await supabase
        .from('exported_tracks')
        .delete()
        .eq('id', track.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exported-tracks'] });
      toast({
        title: "Export Deleted",
        description: "Track removed from cloud"
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  });
}

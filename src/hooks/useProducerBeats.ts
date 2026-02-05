 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { useToast } from '@/hooks/use-toast';
 import type { Database } from '@/integrations/supabase/types';
 
 type ProducerBeatRow = Database['public']['Tables']['producer_beats']['Row'];
 
 export interface ProducerBeat extends ProducerBeatRow {
   // Alias for consistency
   cover_url?: string | null;
 }
 
 export interface CreateBeatInput {
   title: string;
   bpm?: number;
   key_signature?: string;
   genre?: string;
   tags?: string[];
   price_cents?: number;
   exclusive_price_cents?: number;
   license_type?: string;
   description?: string;
   mood?: string[];
 }
 
 export interface UpdateBeatInput extends Partial<CreateBeatInput> {
   status?: string;
   audio_url?: string;
   preview_url?: string;
   cover_image_url?: string;
 }
 
 export function useProducerBeats() {
   const { user } = useAuth();
   const { toast } = useToast();
   const queryClient = useQueryClient();
 
   const beatsQuery = useQuery({
     queryKey: ['producer-beats', user?.id],
 queryFn: async (): Promise<ProducerBeat[]> => {
       if (!user?.id) return [];
       
       const { data, error } = await supabase
         .from('producer_beats')
         .select('*')
         .eq('producer_id', user.id)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return (data || []).map(beat => ({ ...beat, cover_url: beat.cover_image_url }));
     },
     enabled: !!user?.id,
   });
 
   const publishedBeatsQuery = useQuery({
     queryKey: ['producer-beats', user?.id, 'published'],
 queryFn: async (): Promise<ProducerBeat[]> => {
       if (!user?.id) return [];
       
       const { data, error } = await supabase
         .from('producer_beats')
         .select('*')
         .eq('producer_id', user.id)
         .eq('status', 'published')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return (data || []).map(beat => ({ ...beat, cover_url: beat.cover_image_url }));
     },
     enabled: !!user?.id,
   });
 
   const createBeatMutation = useMutation({
     mutationFn: async (input: CreateBeatInput): Promise<ProducerBeat> => {
       if (!user?.id) throw new Error('Not authenticated');
 
       const { data, error } = await supabase
         .from('producer_beats')
         .insert({
           producer_id: user.id,
           title: input.title,
           bpm: input.bpm,
           key_signature: input.key_signature,
           genre: input.genre,
           tags: input.tags,
           description: input.description,
           mood: input.mood,
           price_cents: input.price_cents || 1999,
           exclusive_price_cents: input.exclusive_price_cents || 29900,
           license_type: input.license_type || 'both',
           status: 'draft',
         })
         .select()
         .single();
 
       if (error) throw error;
       return { ...data, cover_url: data.cover_image_url };
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['producer-beats'] });
       toast({
         title: 'Beat Created',
         description: 'Your beat has been added to the catalog.',
       });
     },
     onError: (error) => {
       toast({
         title: 'Failed to create beat',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 
   const updateBeatMutation = useMutation({
     mutationFn: async ({ id, ...input }: UpdateBeatInput & { id: string }): Promise<ProducerBeat> => {
       const { data, error } = await supabase
         .from('producer_beats')
         .update({
           ...input,
           updated_at: new Date().toISOString(),
         })
         .eq('id', id)
         .select()
         .single();
 
       if (error) throw error;
       return { ...data, cover_url: data.cover_image_url };
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['producer-beats'] });
       toast({
         title: 'Beat Updated',
         description: 'Your beat has been updated.',
       });
     },
     onError: (error) => {
       toast({
         title: 'Failed to update beat',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 
   const publishBeatMutation = useMutation({
     mutationFn: async (beatId: string): Promise<ProducerBeat> => {
       const { data, error } = await supabase
         .from('producer_beats')
         .update({ status: 'published', updated_at: new Date().toISOString() })
         .eq('id', beatId)
         .select()
         .single();
 
       if (error) throw error;
       return { ...data, cover_url: data.cover_image_url };
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['producer-beats'] });
       toast({
         title: '🎵 Beat Published!',
         description: 'Your beat is now available for purchase.',
       });
     },
   });
 
   const archiveBeatMutation = useMutation({
     mutationFn: async (beatId: string): Promise<ProducerBeat> => {
       const { data, error } = await supabase
         .from('producer_beats')
         .update({ status: 'archived', updated_at: new Date().toISOString() })
         .eq('id', beatId)
         .select()
         .single();
 
       if (error) throw error;
       return { ...data, cover_url: data.cover_image_url };
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['producer-beats'] });
       toast({
         title: 'Beat Archived',
         description: 'The beat has been archived.',
       });
     },
   });
 
   const deleteBeatMutation = useMutation({
     mutationFn: async (beatId: string) => {
       const { error } = await supabase
         .from('producer_beats')
         .delete()
         .eq('id', beatId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['producer-beats'] });
       toast({
         title: 'Beat Deleted',
         description: 'The beat has been removed from your catalog.',
       });
     },
   });
 
   // Computed stats
   const beats = beatsQuery.data || [];
   const publishedBeats = beats.filter(b => b.status === 'published');
   const draftBeats = beats.filter(b => b.status === 'draft');
   const archivedBeats = beats.filter(b => b.status === 'archived');
   const totalPlays = beats.reduce((sum, b) => sum + (b.plays || 0), 0);
   const totalDownloads = beats.reduce((sum, b) => sum + (b.downloads || 0), 0);
 
   return {
     beats,
     publishedBeats,
     draftBeats,
     archivedBeats,
     totalPlays,
     totalDownloads,
     isLoading: beatsQuery.isLoading,
     error: beatsQuery.error,
     createBeat: createBeatMutation.mutateAsync,
     updateBeat: updateBeatMutation.mutateAsync,
     publishBeat: publishBeatMutation.mutateAsync,
     archiveBeat: archiveBeatMutation.mutateAsync,
     deleteBeat: deleteBeatMutation.mutateAsync,
     isCreating: createBeatMutation.isPending,
     isUpdating: updateBeatMutation.isPending,
     refetch: beatsQuery.refetch,
   };
 }
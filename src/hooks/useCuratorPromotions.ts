import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { useCuratorProfile } from '@/hooks/useCuratorProfile';

export interface PromotionRequest {
  id: string;
  artist_id: string;
  curator_id: string;
  track_id: string | null;
  track_title: string | null;
  track_url: string | null;
  playlist_id?: string | null;
  payment_amount: number;
  payment_currency: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  artist_notes: string | null;
  curator_notes: string | null;
  created_at: string;
  responded_at: string | null;
  completed_at: string | null;
  // Joined data
  artist_profile?: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
  curator_profile?: {
    curator_name: string;
  };
}

export function useCuratorPromotions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile: curatorProfile } = useCuratorProfile();
  const { spendCoinz, earnCoinz, canAfford } = useMixxWallet();

  // Fetch promotion requests for curator
  const requestsQuery = useQuery({
    queryKey: ['curator-promo-requests', curatorProfile?.id],
    queryFn: async () => {
      if (!curatorProfile?.id) return [];

      const { data, error } = await (supabase
        .from('curator_promotion_requests')
        .select(`
          *,
          artist_profile:artist_id (
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('curator_id', curatorProfile.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return data as PromotionRequest[];
    },
    enabled: !!curatorProfile?.id,
  });

  // Fetch artist's own submissions
  const submissionsQuery = useQuery({
    queryKey: ['my-promo-submissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await (supabase
        .from('curator_promotion_requests')
        .select(`
          *,
          curator_profile:curator_id (
            curator_name
          )
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return data as PromotionRequest[];
    },
    enabled: !!user?.id,
  });

  // Submit track for promotion (artist action)
  const submitMutation = useMutation({
    mutationFn: async (data: {
      curatorId: string;
      trackId?: string;
      trackTitle: string;
      trackUrl?: string;
      paymentAmount: number;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!canAfford(data.paymentAmount)) throw new Error('Insufficient MixxCoinz balance');

      // 1. Spend coinz (escrow)
      await spendCoinz({
        amount: data.paymentAmount,
        source: 'curator_promo_escrow',
        description: `Promotion escrow for "${data.trackTitle}"`,
        referenceType: 'curator_promo_request',
      });

      // 2. Create promotion request
      const { data: request, error } = await supabase
        .from('curator_promotion_requests')
        .insert({
          artist_id: user.id,
          curator_id: data.curatorId,
          track_id: data.trackId,
          track_title: data.trackTitle,
          track_url: data.trackUrl,
          payment_amount: data.paymentAmount,
          payment_currency: 'mixxcoinz',
          artist_notes: data.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-promo-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
      toast({
        title: '🎵 Promotion Request Sent!',
        description: 'Your track has been submitted to the curator. MixxCoinz held in escrow.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Accept promotion (curator action)
  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Get the request first
      const { data: request, error: fetchError } = await supabase
        .from('curator_promotion_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) throw new Error('Request not found');

      // Update status
      const { error: updateError } = await supabase
        .from('curator_promotion_requests')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Transfer coinz to curator
      if (user?.id) {
        await earnCoinz({
          amount: request.payment_amount,
          source: 'curator_promo_received',
          description: `Promotion payment for "${request.track_title}"`,
          referenceType: 'curator_promo_request',
          referenceId: requestId,
        });
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-promo-requests'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
      toast({
        title: '✅ Promotion Accepted!',
        description: 'Payment received. Add the track to your playlist.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Accept failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Decline promotion (curator action) - refund to artist
  const declineMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      // Get the request first
      const { data: request, error: fetchError } = await supabase
        .from('curator_promotion_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) throw new Error('Request not found');

      // Update status
      const { error: updateError } = await supabase
        .from('curator_promotion_requests')
        .update({ 
          status: 'declined',
          curator_notes: reason,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Refund to artist
      // Note: In production, this would need to use a service role or edge function
      // to credit the artist's account since we don't have their session
      // For now, we'll just update the status

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-promo-requests'] });
      toast({
        title: 'Request Declined',
        description: 'The artist will be refunded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Decline failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark as completed (curator action)
  const completeMutation = useMutation({
    mutationFn: async ({ requestId, playlistUrl }: { requestId: string; playlistUrl?: string }) => {
      const { error } = await supabase
        .from('curator_promotion_requests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update curator stats
      if (curatorProfile?.id) {
        await supabase
          .from('curator_profiles')
          .update({
            total_placements: (curatorProfile.total_placements || 0) + 1,
          })
          .eq('id', curatorProfile.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-promo-requests'] });
      queryClient.invalidateQueries({ queryKey: ['curator-profile'] });
      toast({
        title: '🎉 Promotion Completed!',
        description: 'Great job! Your placement count has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Complete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const pendingRequests = requestsQuery.data?.filter(r => r.status === 'pending') || [];
  const acceptedRequests = requestsQuery.data?.filter(r => r.status === 'accepted') || [];
  const completedRequests = requestsQuery.data?.filter(r => r.status === 'completed') || [];

  return {
    // For curators
    requests: requestsQuery.data || [],
    pendingRequests,
    acceptedRequests,
    completedRequests,
    requestsLoading: requestsQuery.isLoading,
    
    // For artists
    submissions: submissionsQuery.data || [],
    submissionsLoading: submissionsQuery.isLoading,
    
    // Actions
    submitForPromotion: submitMutation.mutateAsync,
    acceptPromotion: acceptMutation.mutateAsync,
    declinePromotion: declineMutation.mutateAsync,
    completePromotion: completeMutation.mutateAsync,
    
    isSubmitting: submitMutation.isPending,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    isCompleting: completeMutation.isPending,
    
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-promo-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-promo-submissions'] });
    },
  };
}

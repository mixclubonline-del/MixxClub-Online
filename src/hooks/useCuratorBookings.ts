import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { useCuratorProfile } from '@/hooks/useCuratorProfile';

export interface CuratorBooking {
  id: string;
  slot_id: string;
  curator_id: string;
  artist_id: string;
  track_id: string | null;
  track_title: string;
  track_url: string | null;
  premiere_date: string;
  payment_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  artist_notes: string | null;
  curator_notes: string | null;
  escrow_transaction_id: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  // Joined data
  slot?: {
    slot_name: string;
    slot_type: string;
    time_window: string | null;
  };
  artist_profile?: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
}

export function useCuratorBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile: curatorProfile } = useCuratorProfile();
  const { spendCoinz, earnCoinz, canAfford } = useMixxWallet();

  // Curator's bookings (received)
  const curatorBookingsQuery = useQuery({
    queryKey: ['curator-bookings', curatorProfile?.id],
    queryFn: async () => {
      if (!curatorProfile?.id) return [];

      const { data, error } = await supabase
        .from('curator_slot_bookings')
        .select(`
          *,
          slot:slot_id (
            slot_name,
            slot_type,
            time_window
          ),
          artist_profile:artist_id (
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('curator_id', curatorProfile.id)
        .order('premiere_date', { ascending: true });

      if (error) throw error;
      return data as CuratorBooking[];
    },
    enabled: !!curatorProfile?.id,
  });

  // Artist's bookings (sent)
  const artistBookingsQuery = useQuery({
    queryKey: ['my-slot-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('curator_slot_bookings')
        .select(`
          *,
          slot:slot_id (
            slot_name,
            slot_type,
            time_window
          )
        `)
        .eq('artist_id', user.id)
        .order('premiere_date', { ascending: true });

      if (error) throw error;
      return data as CuratorBooking[];
    },
    enabled: !!user?.id,
  });

  // Book a premiere slot (artist action)
  const bookSlotMutation = useMutation({
    mutationFn: async (data: {
      slotId: string;
      curatorId: string;
      trackTitle: string;
      trackUrl?: string;
      trackId?: string;
      premiereDate: string;
      paymentAmount: number;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!canAfford(data.paymentAmount)) throw new Error('Insufficient MixxCoinz balance');

      // 1. Spend coinz (escrow)
      await spendCoinz({
        amount: data.paymentAmount,
        source: 'premiere_slot_escrow',
        description: `Premiere slot booking for "${data.trackTitle}"`,
        referenceType: 'curator_slot_booking',
      });

      // 2. Create booking
      const { data: booking, error } = await supabase
        .from('curator_slot_bookings')
        .insert({
          slot_id: data.slotId,
          curator_id: data.curatorId,
          artist_id: user.id,
          track_id: data.trackId,
          track_title: data.trackTitle,
          track_url: data.trackUrl,
          premiere_date: data.premiereDate,
          payment_amount: data.paymentAmount,
          artist_notes: data.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-slot-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
      toast({
        title: '📅 Slot Booked!',
        description: 'Your premiere slot has been requested. Awaiting curator confirmation.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Confirm booking (curator action)
  const confirmBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      // Get booking details
      const { data: booking, error: fetchError } = await supabase
        .from('curator_slot_bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) throw new Error('Booking not found');

      // Update status
      const { error: updateError } = await supabase
        .from('curator_slot_bookings')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Transfer coinz to curator
      if (user?.id) {
        await earnCoinz({
          amount: booking.payment_amount,
          source: 'premiere_slot_payment',
          description: `Premiere slot payment for "${booking.track_title}"`,
          referenceType: 'curator_slot_booking',
          referenceId: bookingId,
        });
      }

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
      toast({
        title: '✅ Booking Confirmed!',
        description: 'Payment received. The premiere is scheduled.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Confirm failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel booking (curator action) - refund to artist
  const cancelBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      const { error } = await supabase
        .from('curator_slot_bookings')
        .update({ 
          status: 'cancelled',
          curator_notes: reason,
        })
        .eq('id', bookingId);

      if (error) throw error;
      // Note: Refund would be handled by edge function in production
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-bookings'] });
      toast({
        title: 'Booking Cancelled',
        description: 'The artist will be refunded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Cancel failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Complete booking (curator action)
  const completeBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('curator_slot_bookings')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-bookings'] });
      toast({
        title: '🎉 Premiere Completed!',
        description: 'The premiere has been successfully completed.',
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

  const pendingBookings = curatorBookingsQuery.data?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = curatorBookingsQuery.data?.filter(b => b.status === 'confirmed') || [];
  const completedBookings = curatorBookingsQuery.data?.filter(b => b.status === 'completed') || [];

  return {
    // For curators
    bookings: curatorBookingsQuery.data || [],
    pendingBookings,
    confirmedBookings,
    completedBookings,
    bookingsLoading: curatorBookingsQuery.isLoading,
    
    // For artists
    myBookings: artistBookingsQuery.data || [],
    myBookingsLoading: artistBookingsQuery.isLoading,
    
    // Actions
    bookSlot: bookSlotMutation.mutateAsync,
    confirmBooking: confirmBookingMutation.mutateAsync,
    cancelBooking: cancelBookingMutation.mutateAsync,
    completeBooking: completeBookingMutation.mutateAsync,
    
    isBooking: bookSlotMutation.isPending,
    isConfirming: confirmBookingMutation.isPending,
    isCancelling: cancelBookingMutation.isPending,
    isCompleting: completeBookingMutation.isPending,
    
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-slot-bookings'] });
    },
  };
}

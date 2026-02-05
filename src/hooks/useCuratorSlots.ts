import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCuratorProfile } from '@/hooks/useCuratorProfile';

export interface CuratorSlot {
  id: string;
  curator_id: string;
  slot_name: string;
  description: string | null;
  price_coinz: number;
  slot_type: 'standard' | 'featured' | 'exclusive';
  time_window: string | null;
  max_duration_seconds: number;
  available_days: string[];
  max_bookings_per_day: number;
  is_active: boolean;
  created_at: string;
}

export function useCuratorSlots() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile: curatorProfile } = useCuratorProfile();

  const slotsQuery = useQuery({
    queryKey: ['curator-slots', curatorProfile?.id],
    queryFn: async () => {
      if (!curatorProfile?.id) return [];

      const { data, error } = await supabase
        .from('curator_premiere_slots')
        .select('*')
        .eq('curator_id', curatorProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CuratorSlot[];
    },
    enabled: !!curatorProfile?.id,
  });

  const createSlotMutation = useMutation({
    mutationFn: async (data: {
      slot_name: string;
      description?: string;
      price_coinz: number;
      slot_type?: 'standard' | 'featured' | 'exclusive';
      time_window?: string;
      available_days?: string[];
      max_bookings_per_day?: number;
    }) => {
      if (!curatorProfile?.id) throw new Error('Curator profile not found');

      const { data: slot, error } = await supabase
        .from('curator_premiere_slots')
        .insert({
          curator_id: curatorProfile.id,
          slot_name: data.slot_name,
          description: data.description,
          price_coinz: data.price_coinz,
          slot_type: data.slot_type || 'standard',
          time_window: data.time_window,
          available_days: data.available_days || [],
          max_bookings_per_day: data.max_bookings_per_day || 3,
        })
        .select()
        .single();

      if (error) throw error;
      return slot as CuratorSlot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-slots'] });
      toast({
        title: 'Slot Created',
        description: 'Your premiere slot is now available for booking.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create slot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CuratorSlot> }) => {
      const { data, error } = await supabase
        .from('curator_premiere_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CuratorSlot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-slots'] });
      toast({
        title: 'Slot Updated',
        description: 'Your slot has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('curator_premiere_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-slots'] });
      toast({
        title: 'Slot Deleted',
        description: 'The premiere slot has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleSlotMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('curator_premiere_slots')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      return isActive;
    },
    onSuccess: (isActive) => {
      queryClient.invalidateQueries({ queryKey: ['curator-slots'] });
      toast({
        title: isActive ? 'Slot Activated' : 'Slot Paused',
        description: isActive ? 'Artists can now book this slot.' : 'This slot is now hidden from artists.',
      });
    },
  });

  return {
    slots: slotsQuery.data || [],
    isLoading: slotsQuery.isLoading,
    error: slotsQuery.error,
    createSlot: createSlotMutation.mutateAsync,
    updateSlot: updateSlotMutation.mutateAsync,
    deleteSlot: deleteSlotMutation.mutateAsync,
    toggleSlot: toggleSlotMutation.mutateAsync,
    isCreating: createSlotMutation.isPending,
    isUpdating: updateSlotMutation.isPending,
    isDeleting: deleteSlotMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['curator-slots'] }),
  };
}

// Hook for artists to browse available slots from a curator
export function useAvailableCuratorSlots(curatorId: string | undefined) {
  return useQuery({
    queryKey: ['available-curator-slots', curatorId],
    queryFn: async () => {
      if (!curatorId) return [];

      const { data, error } = await supabase
        .from('curator_premiere_slots')
        .select('*')
        .eq('curator_id', curatorId)
        .eq('is_active', true)
        .order('price_coinz', { ascending: true });

      if (error) throw error;
      return data as CuratorSlot[];
    },
    enabled: !!curatorId,
  });
}

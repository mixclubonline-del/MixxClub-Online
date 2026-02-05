import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFanStats } from '@/hooks/useFanStats';

export interface CuratorProfile {
  id: string;
  user_id: string;
  curator_name: string;
  bio: string | null;
  genres: string[];
  avatar_url: string | null;
  cover_url: string | null;
  social_links: Record<string, string>;
  total_placements: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  featured_playlist_id: string | null;
  minimum_payment: number;
  response_time_hours: number;
  status: 'active' | 'paused' | 'suspended';
  created_at: string;
  updated_at: string;
}

const CURATOR_MIN_TIER = 'champion';
const CURATOR_MIN_COINZ = 5000;

export function useCuratorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { stats } = useFanStats();

  const profileQuery = useQuery({
    queryKey: ['curator-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('curator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CuratorProfile | null;
    },
    enabled: !!user?.id,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: {
      curator_name: string;
      bio?: string;
      genres?: string[];
      minimum_payment?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Check eligibility
      if (!stats || stats.mixxcoinz_earned < CURATOR_MIN_COINZ) {
        throw new Error(`You need at least ${CURATOR_MIN_COINZ} earned MixxCoinz to become a curator`);
      }

      const { data: profile, error } = await supabase
        .from('curator_profiles')
        .insert({
          user_id: user.id,
          curator_name: data.curator_name,
          bio: data.bio,
          genres: data.genres || [],
          minimum_payment: data.minimum_payment || 50,
        })
        .select()
        .single();

      if (error) throw error;
      return profile as CuratorProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-profile'] });
      toast({
        title: '🎧 Curator Profile Created!',
        description: 'You can now receive promotion requests from artists.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<CuratorProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('curator_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as CuratorProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curator-profile'] });
      toast({
        title: 'Profile Updated',
        description: 'Your curator profile has been updated.',
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

  const isEligible = stats ? stats.mixxcoinz_earned >= CURATOR_MIN_COINZ : false;
  const coinzNeeded = stats ? Math.max(0, CURATOR_MIN_COINZ - stats.mixxcoinz_earned) : CURATOR_MIN_COINZ;
  const isCurator = !!profileQuery.data;

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    isEligible,
    isCurator,
    coinzNeeded,
    minTier: CURATOR_MIN_TIER,
    minCoinz: CURATOR_MIN_COINZ,
    createProfile: createProfileMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    isCreating: createProfileMutation.isPending,
    isUpdating: updateProfileMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['curator-profile'] }),
  };
}

// Hook to fetch any curator's profile (for artist discovery)
export function useCuratorById(curatorId: string | undefined) {
  return useQuery({
    queryKey: ['curator-profile-by-id', curatorId],
    queryFn: async () => {
      if (!curatorId) return null;

      const { data, error } = await supabase
        .from('curator_profiles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('id', curatorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!curatorId,
  });
}

// Hook to browse all active curators
export function useCuratorDiscovery(filters?: {
  genres?: string[];
  minRating?: number;
  maxPrice?: number;
}) {
  return useQuery({
    queryKey: ['curator-discovery', filters],
    queryFn: async () => {
      let query = supabase
        .from('curator_profiles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('status', 'active')
        .order('total_placements', { ascending: false }) as any;

      if (filters?.minRating) {
        query = query.gte('average_rating', filters.minRating);
      }
      if (filters?.maxPrice) {
        query = query.lte('minimum_payment', filters.maxPrice);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by genres client-side (Supabase doesn't support array contains easily)
      if (filters?.genres && filters.genres.length > 0) {
        return (data || []).filter((curator: any) =>
          filters.genres!.some(genre => (curator.genres || []).includes(genre))
        );
      }

      return data || [];
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DistributorInfo {
  id: string;
  name: string;
  description: string;
  logo: string;
  features: string[];
  price: string;
  popular: boolean;
  signupUrl: string;
  affiliateCode?: string;
}

export const DISTRIBUTORS: DistributorInfo[] = [
  {
    id: "distrokid",
    name: "DistroKid",
    description: "Unlimited uploads for a yearly fee",
    logo: "🎵",
    features: ["Unlimited releases", "Keep 100% royalties", "Fast distribution"],
    price: "$22.99/year",
    popular: true,
    signupUrl: "https://distrokid.com/vip/seven/3883907",
    affiliateCode: "mixclub_ref"
  },
  {
    id: "tunecore",
    name: "TuneCore",
    description: "Pay per release model",
    logo: "🎹",
    features: ["Keep 100% royalties", "YouTube monetization", "Social media"],
    price: "$14.99/single",
    popular: false,
    signupUrl: "https://www.tunecore.com/",
    affiliateCode: "mixclub"
  },
  {
    id: "cdbaby",
    name: "CD Baby",
    description: "One-time fee per release",
    logo: "💿",
    features: ["85% royalties", "Physical distribution", "Sync licensing"],
    price: "$9.95/single",
    popular: false,
    signupUrl: "https://cdbaby.com/",
    affiliateCode: "mixclub"
  },
  {
    id: "amuse",
    name: "Amuse",
    description: "Free distribution with premium options",
    logo: "🎸",
    features: ["Free tier", "Fast splits", "Record label opportunities"],
    price: "Free",
    popular: true,
    signupUrl: "https://www.amuse.io/",
    affiliateCode: "mixclub"
  }
];

export const useDistributionReferrals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['distribution-referrals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('distribution_referrals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUserReleases = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['music-releases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('music_releases')
        .select('*, projects(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useTrackReferral = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ distributorId, distributorName }: { distributorId: string; distributorName: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('distribution_referrals')
        .insert({
          user_id: user.id,
          distributor_id: distributorId,
          distributor_name: distributorName,
          referral_code: `mixclub_${user.id.slice(0, 8)}_${distributorId}`,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-referrals'] });
    },
  });
};

export const useCreateRelease = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (releaseData: {
      project_id?: string;
      distributor_id: string;
      distributor_name: string;
      release_title: string;
      artist_name: string;
      release_type?: string;
      release_date?: string;
      artwork_url?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('music_releases')
        .insert({
          user_id: user.id,
          ...releaseData,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-releases'] });
      toast.success('Release created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create release: ${error.message}`);
    },
  });
};

export const useUpdateRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      releaseId, 
      updates 
    }: { 
      releaseId: string; 
      updates: any;
    }) => {
      const { data, error } = await supabase
        .from('music_releases')
        .update(updates)
        .eq('id', releaseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-releases'] });
      toast.success('Release updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update release: ${error.message}`);
    },
  });
};

export const useGenerateReferralLink = (distributor: DistributorInfo) => {
  const { user } = useAuth();
  const trackReferral = useTrackReferral();

  const generateLink = async () => {
    if (!user) return distributor.signupUrl;

    // Track the referral
    await trackReferral.mutateAsync({
      distributorId: distributor.id,
      distributorName: distributor.name,
    });

    // Get user profile data for pre-filling
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Build referral URL with tracking and pre-filled data
    const url = new URL(distributor.signupUrl);
    
    if (distributor.affiliateCode) {
      url.searchParams.append('ref', distributor.affiliateCode);
    }
    
    // Add MixClub tracking parameter
    url.searchParams.append('utm_source', 'mixclub');
    url.searchParams.append('utm_medium', 'referral');
    url.searchParams.append('utm_campaign', 'distribution_hub');
    url.searchParams.append('mixclub_user_id', user.id);
    
    // Pre-fill user data where possible
    if (profile?.full_name) {
      url.searchParams.append('name', profile.full_name);
    }
    if (user.email) {
      url.searchParams.append('email', user.email);
    }

    return url.toString();
  };

  return { generateLink };
};

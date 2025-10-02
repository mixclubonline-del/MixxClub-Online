import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Distributor configurations with real affiliate links
export const DISTRIBUTORS = [
  {
    id: "distrokid",
    name: "DistroKid",
    description: "Unlimited uploads for a yearly fee",
    logo: "🎵",
    features: ["Unlimited releases", "Keep 100% royalties", "Fast distribution", "YouTube monetization"],
    price: "$22.99/year",
    popular: true,
    affiliateUrl: "https://distrokid.com/vip/seven/",
    signupUrl: "https://distrokid.com/signup/",
  },
  {
    id: "tunecore",
    name: "TuneCore",
    description: "Pay per release model",
    logo: "🎹",
    features: ["Keep 100% royalties", "YouTube monetization", "Social media distribution"],
    price: "$14.99/single",
    popular: false,
    affiliateUrl: "https://www.tunecore.com/",
    signupUrl: "https://www.tunecore.com/signup",
  },
  {
    id: "cdbaby",
    name: "CD Baby",
    description: "One-time fee per release",
    logo: "💿",
    features: ["85% royalties kept", "Physical distribution", "Sync licensing opportunities"],
    price: "$9.95/single",
    popular: false,
    affiliateUrl: "https://cdbaby.com/",
    signupUrl: "https://members.cdbaby.com/sign-up.aspx",
  },
  {
    id: "amuse",
    name: "Amuse",
    description: "Free distribution with premium options",
    logo: "🎸",
    features: ["Free tier available", "Fast revenue splits", "Record label opportunities"],
    price: "Free",
    popular: true,
    affiliateUrl: "https://amuse.io/",
    signupUrl: "https://amuse.io/register",
  }
];

export const useDistributionReferrals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["distribution-referrals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("distribution_referrals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useTrackReferral = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ distributorId, distributorName }: { distributorId: string; distributorName: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const referralCode = `MIXCLUB_${user.id.substring(0, 8)}_${Date.now()}`;
      
      const { data, error } = await supabase
        .from("distribution_referrals")
        .insert({
          user_id: user.id,
          distributor_id: distributorId,
          distributor_name: distributorName,
          referral_code: referralCode,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution-referrals"] });
    },
  });
};

export const useMusicReleases = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["music-releases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("music_releases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateRelease = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (releaseData: any) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("music_releases")
        .insert({
          ...releaseData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-releases"] });
      toast.success("Release created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create release");
      console.error(error);
    },
  });
};

export const useUpdateRelease = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from("music_releases")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-releases"] });
      toast.success("Release updated successfully!");
    },
  });
};

export const useDistributionAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["distribution-analytics", user?.id],
    queryFn: async () => {
      if (!user) return { totalReleases: 0, totalStreams: 0, totalEarnings: 0, platforms: 0 };
      
      const { data: releases } = await supabase
        .from("music_releases")
        .select("streaming_stats, earnings_data, platforms")
        .eq("user_id", user.id);
      
      if (!releases) return { totalReleases: 0, totalStreams: 0, totalEarnings: 0, platforms: 0 };
      
      const stats = releases.reduce((acc, release) => {
        const streamingStats = release.streaming_stats as any || {};
        const earningsData = release.earnings_data as any || {};
        const platforms = release.platforms as any[] || [];
        
        return {
          totalReleases: acc.totalReleases + 1,
          totalStreams: acc.totalStreams + (streamingStats.total_streams || 0),
          totalEarnings: acc.totalEarnings + (earningsData.total_earnings || 0),
          platforms: Math.max(acc.platforms, platforms.length),
        };
      }, { totalReleases: 0, totalStreams: 0, totalEarnings: 0, platforms: 0 });
      
      return stats;
    },
    enabled: !!user,
  });
};

export const buildDistributorLink = (distributor: typeof DISTRIBUTORS[0], userProfile?: any) => {
  const params = new URLSearchParams();
  
  // Add user data for pre-filling
  if (userProfile?.full_name) {
    params.append("artist_name", userProfile.full_name);
  }
  if (userProfile?.email) {
    params.append("email", userProfile.email);
  }
  
  // Add MixClub tracking
  params.append("ref", "mixclub");
  params.append("utm_source", "mixclub");
  params.append("utm_medium", "referral");
  params.append("utm_campaign", "distribution_hub");
  
  const baseUrl = distributor.affiliateUrl || distributor.signupUrl;
  return `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`;
};

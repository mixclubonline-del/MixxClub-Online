import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DistributionPackage {
  id: string;
  package_name: string;
  package_description: string | null;
  price: number;
  currency: string | null;
  billing_cycle: string | null;
  partner_name: string;
  partner_affiliate_url: string;
  features: string[];
  platforms_count: number | null;
  is_featured: boolean | null;
  sort_order: number | null;
}

export interface DistributionReferral {
  id: string;
  referrer_id: string;
  referral_code: string;
  referred_user_id: string | null;
  status: string | null;
  commission_amount: number | null;
  created_at: string | null;
}

// Fetch all distribution packages
export const useDistributionPackages = () => {
  return useQuery({
    queryKey: ["distribution-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_packages")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      return (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : []
      })) as DistributionPackage[];
    },
  });
};

// Track affiliate link clicks
export const useTrackAffiliateClick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      packageId, 
      partnerName 
    }: { 
      packageId: string; 
      partnerName: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Still allow tracking for anonymous users via localStorage
        const clicks = JSON.parse(localStorage.getItem("affiliate_clicks") || "[]");
        clicks.push({ packageId, partnerName, timestamp: new Date().toISOString() });
        localStorage.setItem("affiliate_clicks", JSON.stringify(clicks));
        return { success: true, anonymous: true };
      }

      // Generate referral code if user is logged in
      const referralCode = `MC-${user.id.slice(0, 8).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("distribution_referrals")
        .insert({
          referrer_id: user.id,
          referral_code: referralCode,
          status: "clicked",
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

// Get user's referrals
export const useDistributionReferrals = () => {
  return useQuery({
    queryKey: ["distribution-referrals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("distribution_referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DistributionReferral[];
    },
  });
};

// Build affiliate URL with referral tracking
export const buildAffiliateUrl = (baseUrl: string, userId?: string): string => {
  if (!userId) return baseUrl;
  
  const referralCode = `MC-${userId.slice(0, 8).toUpperCase()}`;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}ref=${referralCode}`;
};

// Legacy exports for backward compatibility
export const useDistribution = () => {
  const { data: packages, isLoading: packagesLoading } = useDistributionPackages();
  const { data: referrals, isLoading: referralsLoading } = useDistributionReferrals();

  return {
    packages: packages || [],
    referrals: referrals || [],
    isLoading: packagesLoading || referralsLoading,
    error: null,
  };
};

export const DISTRIBUTORS = [
  { id: "distrokid", name: "DistroKid", tier: "basic" },
  { id: "tunecore", name: "TuneCore", tier: "pro" },
  { id: "cdbaby", name: "CD Baby", tier: "premium" },
];

export const useMusicReleases = () => ({ data: [], isLoading: false });
export const useCreateRelease = () => ({ mutate: () => {} });
export const useUpdateRelease = () => ({ mutate: () => {} });
export const useDistributionAnalytics = () => ({ data: null, isLoading: false });

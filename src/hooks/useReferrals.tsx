import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserReferrals = (userId?: string) => {
  return useQuery({
    queryKey: ["user-referrals", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("distribution_referrals")
        .select("*, profiles!distribution_referrals_referred_user_id_fkey(full_name, email)")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useReferralStats = (userId?: string) => {
  return useQuery({
    queryKey: ["referral-stats", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("distribution_referrals")
        .select("status, commission_amount")
        .eq("referrer_id", userId);
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        active: data.filter(r => r.status === "active").length,
        pending: data.filter(r => r.status === "pending").length,
        totalCommission: data.reduce((sum, r) => sum + (r.commission_amount || 0), 0),
      };
      
      return stats;
    },
    enabled: !!userId,
  });
};

export const useGenerateReferralCode = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Generate unique code
      const code = `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("distribution_referrals")
        .insert({
          referrer_id: userId,
          referral_code: code,
          status: "pending",
          commission_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-referrals"] });
      toast({
        title: "Referral code generated",
        description: "Share your code and earn commissions!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate code",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useActivateReferral = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      referralCode,
      newUserId,
    }: {
      referralCode: string;
      newUserId: string;
    }) => {
      // Find referral by code
      const { data: referral, error: findError } = await supabase
        .from("distribution_referrals")
        .select("id, referrer_id")
        .eq("referral_code", referralCode)
        .eq("status", "pending")
        .is("referred_user_id", null)
        .single();

      if (findError) throw new Error("Invalid or expired referral code");

      // Update referral
      const { data, error } = await supabase
        .from("distribution_referrals")
        .update({
          referred_user_id: newUserId,
          status: "active",
        })
        .eq("id", referral.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
      toast({
        title: "Referral activated",
        description: "You're now connected via referral!",
      });
    },
    onError: (error) => {
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      referralId,
      amount,
    }: {
      referralId: string;
      amount: number;
    }) => {
      const { data, error } = await supabase
        .from("distribution_referrals")
        .update({
          commission_amount: amount,
        })
        .eq("id", referralId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
    },
  });
};

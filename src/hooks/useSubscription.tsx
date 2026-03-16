import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  limits: {
    storage_gb: number;
    projects: number;
    collaborators: number;
    ai_credits: number;
  };
}

/**
 * Fetch subscription tiers from the subscription_plans DB table.
 * Falls back to sensible defaults if the table is empty or unreachable.
 */
export const useSubscriptionTiers = () => {
  return useQuery({
    queryKey: ["subscription-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return FALLBACK_TIERS;
      }

      return data.map((plan) => ({
        id: plan.id || plan.plan_name,
        name: plan.display_name || plan.plan_name,
        price: plan.price_monthly || 0,
        interval: "monthly" as const,
        features: Array.isArray(plan.features)
          ? plan.features
          : JSON.parse((plan.features as string) || "[]"),
        limits: typeof plan.limits === "object"
          ? {
            storage_gb: (plan.limits as Record<string, number>).storage_gb ?? 5,
            projects: (plan.limits as Record<string, number>).projects ?? 1,
            collaborators: (plan.limits as Record<string, number>).collaborators ?? 2,
            ai_credits: (plan.limits as Record<string, number>).ai_credits ?? 10,
          }
          : { storage_gb: 5, projects: 1, collaborators: 2, ai_credits: 10 },
      })) as SubscriptionTier[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

const FALLBACK_TIERS: SubscriptionTier[] = [
  {
    id: "free", name: "Free", price: 0, interval: "monthly",
    features: ["1 project", "5GB storage", "Basic mixing tools", "Community support"],
    limits: { storage_gb: 5, projects: 1, collaborators: 2, ai_credits: 10 },
  },
  {
    id: "pro", name: "Pro", price: 29, interval: "monthly",
    features: ["Unlimited projects", "50GB storage", "Advanced AI tools", "Priority support", "Collaboration features", "Analytics dashboard"],
    limits: { storage_gb: 50, projects: -1, collaborators: 10, ai_credits: 100 },
  },
  {
    id: "studio", name: "Studio", price: 99, interval: "monthly",
    features: ["Everything in Pro", "500GB storage", "White-label options", "API access", "Custom integrations", "Dedicated support", "Advanced analytics"],
    limits: { storage_gb: 500, projects: -1, collaborators: -1, ai_credits: 500 },
  },
];

/**
 * Fetch the current user's active subscription from Supabase.
 */
export const useUserSubscription = (userId?: string) => {
  return useQuery({
    queryKey: ["user-subscription", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("useUserSubscription error:", error.message);
      }

      if (!data) {
        return {
          id: "default-free",
          user_id: userId,
          subscription_tier: "free",
          status: "active",
          created_at: new Date().toISOString(),
        };
      }

      return data;
    },
    enabled: !!userId,
  });
};

export const useSubscriptionUsage = (userId?: string) => {
  return useQuery({
    queryKey: ["subscription-usage", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { data: audioFiles } = await supabase
        .from("audio_files")
        .select("file_size")
        .eq("user_id", userId);

      const storageUsed = audioFiles?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      const storageUsedGB = storageUsed / (1024 * 1024 * 1024);

      return {
        projects: projectCount || 0,
        storage_gb: storageUsedGB,
        ai_credits_used: 0,
      };
    },
    enabled: !!userId,
  });
};

/**
 * Create subscription checkout session via the real edge function
 */
export const useCreateCheckoutSession = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      tierId,
      billingInterval = 'monthly',
    }: {
      tierId: string;
      userId: string;
      billingInterval?: 'monthly' | 'yearly';
    }) => {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: {
          planId: tierId,
          billingInterval,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      } else if (data?.redirect) {
        window.location.href = data.redirect;
      }
    },
    onError: (error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Cancel subscription via customer portal (Stripe-managed)
 */
export const useCancelSubscription = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (_subscriptionId: string) => {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Manage Subscription",
          description: "You can cancel or modify your subscription in the Stripe portal.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Upgrade subscription via customer portal (Stripe-managed)
 */
export const useUpgradeSubscription = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (_params: {
      subscriptionId: string;
      newTierId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Upgrade Subscription",
          description: "Complete your upgrade in the Stripe portal.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Upgrade failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

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
        // Fallback tiers if DB is unavailable
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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
        .select("*, subscription_plans(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("useUserSubscription error:", error.message);
      }

      // Fallback to free tier when no active subscription found
      return data || {
        id: "default-free",
        user_id: userId,
        tier_id: "free",
        tier: "free",
        status: "active",
        created_at: new Date().toISOString(),
      };
    },
    enabled: !!userId,
  });
};

export const useSubscriptionUsage = (userId?: string) => {
  return useQuery({
    queryKey: ["subscription-usage", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get project count
      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get storage usage (sum of audio file sizes)
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

export const useCreateCheckoutSession = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      tierId,
      userId,
    }: {
      tierId: string;
      userId: string;
    }) => {
      // Call Stripe edge function to create checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          tier_id: tierId,
          user_id: userId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
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

export const useCancelSubscription = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      // Call edge function to cancel via Stripe
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { subscription_id: subscriptionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will remain active until the end of the billing period.",
      });
    },
    onError: (error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpgradeSubscription = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      newTierId,
    }: {
      subscriptionId: string;
      newTierId: string;
    }) => {
      // Call edge function to handle Stripe upgrade
      const { data, error } = await supabase.functions.invoke("upgrade-subscription", {
        body: {
          subscription_id: subscriptionId,
          new_tier_id: newTierId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Subscription upgraded",
        description: "Your subscription has been upgraded successfully!",
      });
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

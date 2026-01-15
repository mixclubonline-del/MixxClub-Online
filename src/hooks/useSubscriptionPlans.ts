import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  features: string[];
  limits: {
    tracks_per_month: number;
    masters_per_month: number;
    storage_gb: number;
    collaborators: number;
    consultations_per_month?: number;
  };
  is_active: boolean;
  sort_order: number;
}

/**
 * Fetch all active subscription plans from database
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      return data.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string || '[]'),
        limits: typeof plan.limits === 'object' ? plan.limits : JSON.parse(plan.limits as string || '{}'),
      })) as SubscriptionPlan[];
    },
  });
}

/**
 * Create subscription checkout session
 */
export function useCreateSubscriptionCheckout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, billingInterval = 'monthly' }: { planId: string; billingInterval?: 'monthly' | 'yearly' }) => {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId, billingInterval },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      } else if (data.redirect) {
        window.location.href = data.redirect;
      }
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create checkout session',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get current user's active subscription
 */
export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
}

/**
 * Calculate yearly savings
 */
export function calculateYearlySavings(plan: SubscriptionPlan): number {
  if (!plan.price_yearly) return 0;
  const monthlyAnnualized = plan.price_monthly * 12;
  return monthlyAnnualized - plan.price_yearly;
}

/**
 * Get yearly discount percentage
 */
export function getYearlyDiscountPercent(plan: SubscriptionPlan): number {
  if (!plan.price_yearly || plan.price_monthly === 0) return 0;
  const savings = calculateYearlySavings(plan);
  return Math.round((savings / (plan.price_monthly * 12)) * 100);
}

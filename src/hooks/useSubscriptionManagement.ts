import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  tier: string;
}

const REFRESH_INTERVAL_MS = 60_000; // 1 minute

export const useSubscriptionManagement = () => {
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCurrentSubscription({ subscribed: false, productId: null, subscriptionEnd: null, tier: 'free' });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      setCurrentSubscription({
        subscribed: data.subscribed,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
        tier: data.tier || 'free',
      });
    } catch (err) {
      console.error('[useSubscriptionManagement] Check failed:', err);
      setCurrentSubscription({ subscribed: false, productId: null, subscriptionEnd: null, tier: 'free' });
    } finally {
      setLoading(false);
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('[useSubscriptionManagement] Portal error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not open subscription management.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Check on mount
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(checkSubscription, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  // Re-check on auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event) => {
      checkSubscription();
    });
    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  const currentPlan = currentSubscription ? {
    tier: currentSubscription.tier,
    subscribed: currentSubscription.subscribed,
    subscriptionEnd: currentSubscription.subscriptionEnd,
  } : null;

  return {
    currentSubscription,
    currentPlan,
    loading,
    checkSubscription,
    openCustomerPortal,
  };
};

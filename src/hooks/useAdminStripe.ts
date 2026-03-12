import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
  refunded: boolean;
  amount_refunded: number;
  customer_email: string | null;
  description: string | null;
  payment_intent: string | null;
  created: string;
}

export interface StripeDispute {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  charge_id: string;
  created: string;
  evidence_due: string | null;
}

export interface StripePayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: string;
  created: string;
}

export interface TierBreakdown {
  name: string;
  count: number;
  revenue: number;
}

export interface StripeDashboardData {
  balance: { available: number; pending: number };
  charges: StripeCharge[];
  disputes: StripeDispute[];
  open_disputes_count: number;
  subscriptions: {
    active_count: number;
    mrr: number;
    tier_breakdown: TierBreakdown[];
  };
  payouts: StripePayout[];
  fetched_at: string;
}

export const useAdminStripe = () => {
  const [data, setData] = useState<StripeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const { data: result, error: fnError } = await supabase.functions.invoke('admin-stripe-dashboard');
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch Stripe data';
      setError(msg);
      console.error('[useAdminStripe]', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const executeAction = async (action: string, params: Record<string, any>) => {
    setActionLoading(true);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('admin-stripe-dashboard', {
        body: { action, ...params },
      });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      toast.success(`Action "${action}" completed successfully`);
      // Refresh data after action
      await fetchDashboard();
      return result;
    } catch (err: any) {
      const msg = err?.message || `Action "${action}" failed`;
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const refund = (paymentIntentId: string, amount?: number, reason?: string) =>
    executeAction('refund', { payment_intent_id: paymentIntentId, amount, reason });

  const acceptDispute = (disputeId: string) =>
    executeAction('accept_dispute', { dispute_id: disputeId });

  const cancelSubscription = (subscriptionId: string) =>
    executeAction('cancel_subscription', { subscription_id: subscriptionId });

  return {
    data, loading, error, actionLoading,
    refresh: fetchDashboard,
    refund, acceptDispute, cancelSubscription,
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EngineerPayout {
  id: string;
  engineer_id: string;
  payment_id: string | null;
  project_id: string | null;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  stripe_transfer_id: string | null;
  payout_method: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at: string | null;
  eligible_for_payout_at: string | null;
  project?: {
    title: string;
  } | null;
}

interface PayoutSummary {
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  pendingCount: number;
  completedCount: number;
}

export const useEngineerPayouts = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<EngineerPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PayoutSummary>({
    totalPending: 0,
    totalProcessing: 0,
    totalCompleted: 0,
    totalFailed: 0,
    pendingCount: 0,
    completedCount: 0,
  });

  useEffect(() => {
    if (!user) {
      setPayouts([]);
      setIsLoading(false);
      return;
    }

    const fetchPayouts = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('engineer_payouts')
          .select(`
            *,
            project:projects(title)
          `)
          .eq('engineer_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        const typedPayouts = (data || []).map(payout => ({
          ...payout,
          status: payout.status as EngineerPayout['status'],
        }));

        setPayouts(typedPayouts);

        // Calculate summary
        const newSummary = typedPayouts.reduce(
          (acc, payout) => {
            switch (payout.status) {
              case 'pending':
                acc.totalPending += payout.net_amount;
                acc.pendingCount++;
                break;
              case 'processing':
                acc.totalProcessing += payout.net_amount;
                break;
              case 'completed':
                acc.totalCompleted += payout.net_amount;
                acc.completedCount++;
                break;
              case 'failed':
                acc.totalFailed += payout.net_amount;
                break;
            }
            return acc;
          },
          {
            totalPending: 0,
            totalProcessing: 0,
            totalCompleted: 0,
            totalFailed: 0,
            pendingCount: 0,
            completedCount: 0,
          }
        );

        setSummary(newSummary);
        setError(null);
      } catch (err) {
        console.error('Error fetching engineer payouts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayouts();

    // Set up realtime subscription
    const channel = supabase
      .channel('engineer_payouts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'engineer_payouts',
          filter: `engineer_id=eq.${user.id}`,
        },
        () => {
          // Refetch on any change
          fetchPayouts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    payouts,
    isLoading,
    error,
    summary,
    pendingPayouts: payouts.filter(p => p.status === 'pending'),
    completedPayouts: payouts.filter(p => p.status === 'completed'),
    processingPayouts: payouts.filter(p => p.status === 'processing'),
  };
};

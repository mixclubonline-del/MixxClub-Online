import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MixxWallet {
  id: string;
  user_id: string;
  earned_balance: number;
  purchased_balance: number;
  total_earned: number;
  total_purchased: number;
  total_spent: number;
  total_gifted: number;
  total_received: number;
  daily_purchased: number;
  daily_purchased_reset_at: string;
}

export interface MixxTransaction {
  id: string;
  user_id: string;
  transaction_type: 'EARN' | 'SPEND' | 'PURCHASE' | 'GIFT_SENT' | 'GIFT_RECEIVED' | 'CASHOUT' | 'REFUND';
  source: string;
  amount: number;
  balance_type: 'earned' | 'purchased';
  reference_type?: string;
  reference_id?: string;
  counterparty_id?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export function useMixxWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['mixx-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_or_create_wallet', { p_user_id: user.id });

      if (error) throw error;
      return data as MixxWallet;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const transactionsQuery = useQuery({
    queryKey: ['mixx-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mixx_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as MixxTransaction[];
    },
    enabled: !!user?.id,
  });

  const earnMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      source, 
      description,
      referenceType,
      referenceId 
    }: { 
      amount: number; 
      source: string; 
      description?: string;
      referenceType?: string;
      referenceId?: string;
    }) => {
      if (!user?.id || !walletQuery.data) throw new Error('No wallet');

      // Update wallet
      const { error: walletError } = await supabase
        .from('mixx_wallets')
        .update({
          earned_balance: walletQuery.data.earned_balance + amount,
          total_earned: walletQuery.data.total_earned + amount,
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Record transaction
      const { error: txError } = await supabase
        .from('mixx_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'EARN',
          source,
          amount,
          balance_type: 'earned',
          description,
          reference_type: referenceType,
          reference_id: referenceId,
        });

      if (txError) throw txError;

      return { amount, source };
    },
    onSuccess: ({ amount }) => {
      queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-transactions'] });
      toast({
        title: '🪙 MixxCoinz Earned!',
        description: `+${amount} coinz added to your wallet`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to earn coinz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const spendMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      source, 
      description,
      preferEarned = true,
      referenceType,
      referenceId 
    }: { 
      amount: number; 
      source: string; 
      description?: string;
      preferEarned?: boolean;
      referenceType?: string;
      referenceId?: string;
    }) => {
      if (!user?.id || !walletQuery.data) throw new Error('No wallet');
      
      const wallet = walletQuery.data;
      const totalBalance = wallet.earned_balance + wallet.purchased_balance;
      
      if (totalBalance < amount) {
        throw new Error('Insufficient balance');
      }

      let earnedToSpend = 0;
      let purchasedToSpend = 0;

      if (preferEarned) {
        earnedToSpend = Math.min(wallet.earned_balance, amount);
        purchasedToSpend = amount - earnedToSpend;
      } else {
        purchasedToSpend = Math.min(wallet.purchased_balance, amount);
        earnedToSpend = amount - purchasedToSpend;
      }

      // Update wallet
      const { error: walletError } = await supabase
        .from('mixx_wallets')
        .update({
          earned_balance: wallet.earned_balance - earnedToSpend,
          purchased_balance: wallet.purchased_balance - purchasedToSpend,
          total_spent: wallet.total_spent + amount,
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Record transactions
      const transactions = [];
      
      if (earnedToSpend > 0) {
        transactions.push({
          user_id: user.id,
          transaction_type: 'SPEND' as const,
          source,
          amount: earnedToSpend,
          balance_type: 'earned' as const,
          description,
          reference_type: referenceType,
          reference_id: referenceId,
        });
      }
      
      if (purchasedToSpend > 0) {
        transactions.push({
          user_id: user.id,
          transaction_type: 'SPEND' as const,
          source,
          amount: purchasedToSpend,
          balance_type: 'purchased' as const,
          description,
          reference_type: referenceType,
          reference_id: referenceId,
        });
      }

      if (transactions.length > 0) {
        const { error: txError } = await supabase
          .from('mixx_transactions')
          .insert(transactions);

        if (txError) throw txError;
      }

      return { amount, source };
    },
    onSuccess: ({ amount }) => {
      queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-transactions'] });
      toast({
        title: 'Purchase Complete',
        description: `-${amount} coinz spent`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Transaction Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const totalBalance = walletQuery.data 
    ? walletQuery.data.earned_balance + walletQuery.data.purchased_balance 
    : 0;

  const canAfford = (amount: number) => totalBalance >= amount;

  return {
    wallet: walletQuery.data,
    transactions: transactionsQuery.data || [],
    isLoading: walletQuery.isLoading,
    error: walletQuery.error,
    totalBalance,
    canAfford,
    earnCoinz: earnMutation.mutateAsync,
    spendCoinz: spendMutation.mutateAsync,
    isEarning: earnMutation.isPending,
    isSpending: spendMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-transactions'] });
    },
  };
}

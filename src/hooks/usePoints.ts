import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const usePoints = () => {
  const queryClient = useQueryClient();

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['points-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data.points || 0;
    }
  });

  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['points-ledger'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('points_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const cashout = useMutation({
    mutationFn: async (amount: number) => {
      const { data, error } = await supabase.functions.invoke('points-cashout', {
        body: { amount }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-balance'] });
      queryClient.invalidateQueries({ queryKey: ['points-ledger'] });
      toast.success('Cashout initiated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process cashout');
    }
  });

  return {
    balance,
    ledger,
    isLoading: balanceLoading || ledgerLoading,
    cashout
  };
};

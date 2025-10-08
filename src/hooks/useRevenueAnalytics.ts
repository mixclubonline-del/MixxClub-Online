import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRevenueAnalytics = () => {
  const queryClient = useQueryClient();

  const { data: snapshots, isLoading } = useQuery({
    queryKey: ['financial-snapshots'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('financial_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: false })
        .limit(90);

      if (error) throw error;
      return data;
    }
  });

  const { data: forecasts } = useQuery({
    queryKey: ['revenue-forecasts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('revenue_forecasts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  const generateForecast = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-revenue-forecast');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue-forecasts'] });
      toast.success('Revenue forecast generated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate forecast');
    }
  });

  return { snapshots, forecasts, isLoading, generateForecast };
};

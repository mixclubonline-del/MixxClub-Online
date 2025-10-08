import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLabelDeals = () => {
  const queryClient = useQueryClient();

  const { data: deals, isLoading } = useQuery({
    queryKey: ['label-deals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('label_deals')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: royalties } = useQuery({
    queryKey: ['label-royalties'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('label_royalties')
        .select(`
          *,
          label_deals (*)
        `)
        .eq('artist_id', user.id)
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const createDeal = useMutation({
    mutationFn: async (dealData: any) => {
      const { data, error } = await supabase.functions.invoke('label-deal-create', {
        body: dealData
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-deals'] });
      toast.success('Label deal created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create deal');
    }
  });

  return { deals, royalties, isLoading, createDeal };
};

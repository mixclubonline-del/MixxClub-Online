import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useDisputes = () => {
  const queryClient = useQueryClient();

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          projects(title, client_id, engineer_id),
          profiles:raised_by(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createDispute = useMutation({
    mutationFn: async (disputeData: {
      project_id: string;
      reason: string;
      description: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('dispute-create', {
        body: disputeData
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('Dispute created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create dispute');
    }
  });

  const resolveDispute = useMutation({
    mutationFn: async (params: {
      dispute_id: string;
      resolution: string;
      notes?: string;
      refund_amount?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('dispute-resolve', {
        body: params
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('Dispute resolved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resolve dispute');
    }
  });

  return { disputes, isLoading, createDispute, resolveDispute };
};

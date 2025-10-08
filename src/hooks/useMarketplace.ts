import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useMarketplace = () => {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['marketplace-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          id,
          item_name,
          item_description,
          item_type,
          price,
          thumbnail_url,
          average_rating,
          total_reviews,
          download_count,
          is_published,
          is_free
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const createItem = useMutation({
    mutationFn: async (itemData: {
      item_type: string;
      item_name: string;
      item_description?: string;
      price: number;
      thumbnail_url?: string;
      file_url?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('marketplace-create-item', {
        body: itemData
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      toast.success('Item created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create item');
    }
  });

  const purchaseItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.functions.invoke('marketplace-purchase', {
        body: { item_id: itemId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start purchase');
    }
  });

  return { items, isLoading, createItem, purchaseItem };
};

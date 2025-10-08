import { useState } from 'react';
import { toast } from 'sonner';

// Simple mock data for now - replace with actual Supabase query once schema is confirmed
export const useMarketplace = () => {
  const [isLoading] = useState(false);
  const items: any[] = [];

  const createItem = {
    mutate: async (data: any) => {
      toast.success('Item creation coming soon');
    },
    isPending: false
  };

  const purchaseItem = {
    mutate: async (id: string) => {
      toast.success('Purchase flow coming soon');
    },
    isPending: false
  };

  return { items, isLoading, createItem, purchaseItem };
};

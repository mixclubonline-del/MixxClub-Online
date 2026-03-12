/**
 * useMarketplace — Legacy hook for SellerDashboard.
 * Now wired to live Supabase queries instead of in-memory mock store.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SellerStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalSales: number;
  totalDownloads: number;
  averageRating: number;
  productsCount: number;
}

export const useMarketplace = () => {
  const { user } = useAuth();

  const { data: sellerProducts = [] } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: sellerStats = {
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalSales: 0,
    totalDownloads: 0,
    averageRating: 0,
    productsCount: 0,
  } } = useQuery({
    queryKey: ['seller-stats', user?.id],
    queryFn: async (): Promise<SellerStats> => {
      if (!user?.id) return {
        totalEarnings: 0, monthlyEarnings: 0, totalSales: 0,
        totalDownloads: 0, averageRating: 0, productsCount: 0,
      };

      // Get all purchases where this user is the seller
      const { data: purchases, error: purchaseError } = await supabase
        .from('marketplace_purchases')
        .select('purchase_amount, created_at')
        .eq('seller_id', user.id)
        .eq('status', 'completed');

      if (purchaseError) throw purchaseError;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const totalEarnings = (purchases || []).reduce((sum, p) => sum + (p.purchase_amount || 0), 0);
      const monthlyEarnings = (purchases || [])
        .filter(p => p.created_at >= monthStart)
        .reduce((sum, p) => sum + (p.purchase_amount || 0), 0);

      // Get product count
      const { count: productsCount } = await supabase
        .from('marketplace_items')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', user.id);

      return {
        totalEarnings,
        monthlyEarnings,
        totalSales: purchases?.length || 0,
        totalDownloads: purchases?.length || 0,
        averageRating: 0, // No rating system on marketplace_items yet
        productsCount: productsCount || 0,
      };
    },
    enabled: !!user?.id,
  });

  const { data: sellerEarnings = [] } = useQuery({
    queryKey: ['seller-earnings-chart', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get last 7 days of sales
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: purchases, error } = await supabase
        .from('marketplace_purchases')
        .select('purchase_amount, created_at')
        .eq('seller_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, { amount: number; sales: number }>();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyMap.set(key, { amount: 0, sales: 0 });
      }

      (purchases || []).forEach(p => {
        const key = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = dailyMap.get(key);
        if (existing) {
          existing.amount += p.purchase_amount || 0;
          existing.sales += 1;
        }
      });

      return Array.from(dailyMap.entries()).map(([date, { amount, sales }]) => ({
        date, amount, sales,
      }));
    },
    enabled: !!user?.id,
  });

  return {
    sellerProducts,
    sellerStats,
    sellerEarnings,
    handleUploadProduct: () => {},
    handleDeleteProduct: () => {},
  };
};

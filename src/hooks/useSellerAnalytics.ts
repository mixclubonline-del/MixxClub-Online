/**
 * Hook for seller analytics data.
 * Aggregates from purchases, product_reviews, and marketplace_products tables.
 * Uses `as any` casts because these tables may not yet exist in generated types.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SellerAnalyticsData {
    totalRevenue: number;
    totalSales: number;
    totalProducts: number;
    averageRating: number;
    totalReviews: number;
    revenueByMonth: { month: string; revenue: number; sales: number }[];
    topProducts: { id: string; title: string; sales: number; revenue: number }[];
    ratingTrend: { month: string; average: number; count: number }[];
}

export const useSellerAnalytics = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['seller-analytics', user?.id],
        queryFn: async (): Promise<SellerAnalyticsData> => {
            if (!user) throw new Error('Must be authenticated');

            // Fetch products owned by seller
            const { data: products } = await (supabase as any)
                .from('marketplace_products')
                .select('id, title, price')
                .eq('seller_id', user.id);

            if (!products || products.length === 0) {
                return {
                    totalRevenue: 0,
                    totalSales: 0,
                    totalProducts: 0,
                    averageRating: 0,
                    totalReviews: 0,
                    revenueByMonth: [],
                    topProducts: [],
                    ratingTrend: [],
                };
            }

            const productIds = (products as any[]).map((p: any) => p.id);

            // Fetch purchases for these products
            const { data: purchases } = await (supabase as any)
                .from('purchases')
                .select('product_id, amount, created_at')
                .in('product_id', productIds);

            // Fetch reviews for these products
            const { data: reviews } = await (supabase as any)
                .from('product_reviews')
                .select('product_id, rating, created_at')
                .in('product_id', productIds);

            const purchaseList = (purchases || []) as Array<Record<string, unknown>>;
            const reviewList = (reviews || []) as Array<Record<string, unknown>>;

            // Calculate totals
            const totalRevenue = purchaseList.reduce((sum, p) => sum + ((p.amount as number) || 0), 0);
            const totalSales = purchaseList.length;
            const totalProducts = products.length;
            const totalReviews = reviewList.length;
            const averageRating = totalReviews > 0
                ? Math.round((reviewList.reduce((sum, r) => sum + (r.rating as number), 0) / totalReviews) * 10) / 10
                : 0;

            // Revenue by month (last 12 months)
            const revenueByMonthMap = new Map<string, { revenue: number; sales: number }>();
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                revenueByMonthMap.set(key, { revenue: 0, sales: 0 });
            }

            purchaseList.forEach((p) => {
                const d = new Date(p.created_at as string);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const entry = revenueByMonthMap.get(key);
                if (entry) {
                    entry.revenue += (p.amount as number) || 0;
                    entry.sales += 1;
                }
            });

            const revenueByMonth = Array.from(revenueByMonthMap.entries()).map(([month, data]) => ({
                month,
                ...data,
            }));

            // Top products by revenue
            const productRevMap = new Map<string, { sales: number; revenue: number }>();
            purchaseList.forEach((p) => {
                const id = p.product_id as string;
                const entry = productRevMap.get(id) || { sales: 0, revenue: 0 };
                entry.sales += 1;
                entry.revenue += (p.amount as number) || 0;
                productRevMap.set(id, entry);
            });

            const topProducts = (products as any[])
                .map((p: any) => ({
                    id: p.id as string,
                    title: p.title as string,
                    ...(productRevMap.get(p.id) || { sales: 0, revenue: 0 }),
                }))
                .sort((a: any, b: any) => b.revenue - a.revenue)
                .slice(0, 10);

            // Rating trend by month (last 12 months)
            const ratingByMonthMap = new Map<string, { sum: number; count: number }>();
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                ratingByMonthMap.set(key, { sum: 0, count: 0 });
            }

            reviewList.forEach((r) => {
                const d = new Date(r.created_at as string);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const entry = ratingByMonthMap.get(key);
                if (entry) {
                    entry.sum += r.rating as number;
                    entry.count += 1;
                }
            });

            const ratingTrend = Array.from(ratingByMonthMap.entries()).map(([month, data]) => ({
                month,
                average: data.count > 0 ? Math.round((data.sum / data.count) * 10) / 10 : 0,
                count: data.count,
            }));

            return {
                totalRevenue,
                totalSales,
                totalProducts,
                averageRating,
                totalReviews,
                revenueByMonth,
                topProducts,
                ratingTrend,
            };
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });
};
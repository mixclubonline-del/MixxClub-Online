 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { startOfMonth, subMonths, format } from 'date-fns';
 import type { Database } from '@/integrations/supabase/types';
 
 type BeatPurchaseRow = Database['public']['Tables']['beat_purchases']['Row'];
 
 export interface BeatSale extends BeatPurchaseRow {
   beat?: {
     id: string;
     title: string;
     cover_image_url: string | null;
   } | null;
 }
 
 export interface SalesAnalytics {
   totalRevenue: number;
   thisMonthRevenue: number;
   lastMonthRevenue: number;
   monthlyGrowth: number;
   totalSales: number;
   leaseSales: number;
   exclusiveSales: number;
   pendingEarnings: number;
   topSellingBeatId: string | null;
   revenueByMonth: { month: string; revenue: number }[];
 }
 
 export function useProducerSales() {
   const { user } = useAuth();
 
   const salesQuery = useQuery({
     queryKey: ['producer-sales', user?.id],
     queryFn: async () => {
       if (!user?.id) return [];
       
       const { data, error } = await supabase
         .from('beat_purchases')
         .select(`
           *,
           beat:producer_beats(id, title, cover_image_url)
         `)
         .eq('seller_id', user.id)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return (data || []) as unknown as BeatSale[];
     },
     enabled: !!user?.id,
   });
 
   const analyticsQuery = useQuery({
     queryKey: ['producer-sales-analytics', user?.id],
     queryFn: async (): Promise<SalesAnalytics> => {
       if (!user?.id) {
         return {
           totalRevenue: 0,
           thisMonthRevenue: 0,
           lastMonthRevenue: 0,
           monthlyGrowth: 0,
           totalSales: 0,
           leaseSales: 0,
           exclusiveSales: 0,
           pendingEarnings: 0,
           topSellingBeatId: null,
           revenueByMonth: [],
         };
       }
       
       const { data: sales, error } = await supabase
         .from('beat_purchases')
         .select('*')
         .eq('seller_id', user.id)
         .eq('status', 'completed');
 
       if (error) throw error;
 
       const allSales = sales || [];
       const now = new Date();
       const thisMonthStart = startOfMonth(now);
       const lastMonthStart = startOfMonth(subMonths(now, 1));
 
       // Calculate totals
       const totalRevenue = allSales.reduce((sum, s) => sum + s.seller_earnings_cents, 0);
       
       const thisMonthSales = allSales.filter(s => new Date(s.created_at) >= thisMonthStart);
       const thisMonthRevenue = thisMonthSales.reduce((sum, s) => sum + s.seller_earnings_cents, 0);
       
       const lastMonthSales = allSales.filter(s => {
         const date = new Date(s.created_at);
         return date >= lastMonthStart && date < thisMonthStart;
       });
       const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + s.seller_earnings_cents, 0);
       
       const monthlyGrowth = lastMonthRevenue > 0 
         ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
         : thisMonthRevenue > 0 ? 100 : 0;
 
       const leaseSales = allSales.filter(s => s.license_type === 'lease').length;
       const exclusiveSales = allSales.filter(s => s.license_type === 'exclusive').length;
 
       // Find top selling beat
       const beatCounts: Record<string, number> = {};
       allSales.forEach(s => {
         if (s.beat_id) {
           beatCounts[s.beat_id] = (beatCounts[s.beat_id] || 0) + 1;
         }
       });
       const topSellingBeatId = Object.entries(beatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
 
       // Revenue by month (last 6 months)
       const revenueByMonth: { month: string; revenue: number }[] = [];
       for (let i = 5; i >= 0; i--) {
         const monthStart = startOfMonth(subMonths(now, i));
         const monthEnd = startOfMonth(subMonths(now, i - 1));
         const monthSales = allSales.filter(s => {
           const date = new Date(s.created_at);
           return date >= monthStart && date < monthEnd;
         });
         revenueByMonth.push({
           month: format(monthStart, 'MMM'),
           revenue: monthSales.reduce((sum, s) => sum + s.seller_earnings_cents, 0) / 100,
         });
       }
 
       return {
         totalRevenue,
         thisMonthRevenue,
         lastMonthRevenue,
         monthlyGrowth,
         totalSales: allSales.length,
         leaseSales,
         exclusiveSales,
         pendingEarnings: 0, // Would come from pending payouts
         topSellingBeatId,
         revenueByMonth,
       };
     },
     enabled: !!user?.id,
   });
 
   return {
     sales: salesQuery.data || [],
     analytics: analyticsQuery.data,
     isLoading: salesQuery.isLoading || analyticsQuery.isLoading,
     error: salesQuery.error || analyticsQuery.error,
     refetch: () => {
       salesQuery.refetch();
       analyticsQuery.refetch();
     },
   };
 }
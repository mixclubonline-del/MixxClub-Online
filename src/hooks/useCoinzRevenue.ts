/**
 * useCoinzRevenue — Aggregates coinz earned by an artist from tips, promos, etc.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RevenueBySource {
    source: string;
    total: number;
    count: number;
}

export interface DailyRevenue {
    date: string;
    amount: number;
}

export function useCoinzRevenue() {
    const { user } = useAuth();

    const revenueQuery = useQuery({
        queryKey: ['coinz-revenue', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;

            // Fetch all EARN and GIFT_RECEIVED transactions
            const { data, error } = await supabase
                .from('mixx_transactions')
                .select('*')
                .eq('user_id', user.id)
                .in('transaction_type', ['EARN', 'GIFT_RECEIVED'])
                .order('created_at', { ascending: false })
                .limit(500);

            if (error) throw error;

            const transactions = data || [];

            // Group by source
            const bySource: Record<string, RevenueBySource> = {};
            transactions.forEach((tx) => {
                const src = tx.source || 'unknown';
                if (!bySource[src]) {
                    bySource[src] = { source: src, total: 0, count: 0 };
                }
                bySource[src].total += tx.amount;
                bySource[src].count += 1;
            });

            // Group by day (last 30 days)
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const dailyMap: Record<string, number> = {};

            for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
                dailyMap[d.toISOString().slice(0, 10)] = 0;
            }

            transactions.forEach((tx) => {
                const date = tx.created_at.slice(0, 10);
                if (dailyMap[date] !== undefined) {
                    dailyMap[date] += tx.amount;
                }
            });

            const dailyRevenue: DailyRevenue[] = Object.entries(dailyMap).map(([date, amount]) => ({
                date,
                amount,
            }));

            const totalEarned = transactions.reduce((sum, tx) => sum + tx.amount, 0);
            const thisWeek = transactions
                .filter(tx => new Date(tx.created_at).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000)
                .reduce((sum, tx) => sum + tx.amount, 0);
            const lastWeek = transactions
                .filter(tx => {
                    const t = new Date(tx.created_at).getTime();
                    return t > now.getTime() - 14 * 24 * 60 * 60 * 1000 && t <= now.getTime() - 7 * 24 * 60 * 60 * 1000;
                })
                .reduce((sum, tx) => sum + tx.amount, 0);

            const weeklyTrend = lastWeek > 0
                ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
                : thisWeek > 0 ? 100 : 0;

            return {
                totalEarned,
                thisWeek,
                lastWeek,
                weeklyTrend,
                bySource: Object.values(bySource).sort((a, b) => b.total - a.total),
                dailyRevenue,
                transactionCount: transactions.length,
            };
        },
        enabled: !!user?.id,
        staleTime: 60000,
    });

    return {
        revenue: revenueQuery.data,
        isLoading: revenueQuery.isLoading,
        error: revenueQuery.error,
    };
}

/**
 * useUserEarnings — Shared cached query for user earnings + sales data.
 * 
 * Combines engineer_earnings (service income) and marketplace_purchases
 * (product sales) into a single cached query used by Dashboard, Revenue,
 * and GrowthHub.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUserEarnings(userId: string | undefined) {
    return useQuery({
        queryKey: ['user-earnings', userId],
        queryFn: async () => {
            if (!userId) return { earnings: [], sales: [] };

            const [earningsResult, salesResult] = await Promise.all([
                supabase
                    .from('engineer_earnings')
                    .select('*')
                    .eq('engineer_id', userId)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('marketplace_purchases')
                    .select('*')
                    .eq('seller_id', userId)
                    .order('created_at', { ascending: false }),
            ]);

            return {
                earnings: earningsResult.data || [],
                sales: salesResult.data || [],
                totalEarnings: (earningsResult.data || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
                totalSales: (salesResult.data || []).reduce((sum: number, s: any) => sum + (s.purchase_amount || 0), 0),
            };
        },
        enabled: !!userId,
        staleTime: 60_000,
    });
}

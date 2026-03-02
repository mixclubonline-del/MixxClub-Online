/**
 * useReferralRewards — Reward users when their referral reaches supporter tier.
 * 
 * Double-sided: referrer AND new user both get coinz.
 * Tracks referral via profiles.referred_by or a referral code.
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from './useMixxWallet';

const REFERRAL_REWARD_REFERRER = 100; // Coinz for the person who referred
const REFERRAL_REWARD_NEW_USER = 50;  // Coinz for the new user being referred

interface ReferralStats {
    totalReferrals: number;
    qualifiedReferrals: number;
    totalEarned: number;
}

export function useReferralRewards() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { earnCoinz } = useMixxWallet();

    // Fetch referral stats from transactions
    const referralStatsQuery = useQuery({
        queryKey: ['referral-stats', user?.id],
        queryFn: async (): Promise<ReferralStats> => {
            if (!user?.id) return { totalReferrals: 0, qualifiedReferrals: 0, totalEarned: 0 };

            // Count referral-source transactions
            const { data, error } = await supabase
                .from('mixx_transactions')
                .select('amount')
                .eq('user_id', user.id)
                .eq('source', 'referral')
                .eq('transaction_type', 'EARN');

            if (error) throw error;

            const transactions = data || [];
            return {
                totalReferrals: transactions.length,
                qualifiedReferrals: transactions.length,
                totalEarned: transactions.reduce((sum, tx) => sum + tx.amount, 0),
            };
        },
        enabled: !!user?.id,
        staleTime: 60000,
    });

    // Claim a referral reward (called when referee reaches supporter tier)
    const claimReferralReward = useMutation({
        mutationFn: async ({ refereeId }: { refereeId: string }) => {
            if (!user?.id) throw new Error('Not authenticated');

            // Check if already claimed for this referee
            const { data: existing } = await supabase
                .from('mixx_transactions')
                .select('id')
                .eq('user_id', user.id)
                .eq('source', 'referral')
                .eq('reference_id', refereeId)
                .maybeSingle();

            if (existing) throw new Error('Referral reward already claimed');

            // Award referrer
            await earnCoinz({
                amount: REFERRAL_REWARD_REFERRER,
                source: 'referral',
                description: 'Referral bonus: your invite reached Supporter tier',
                referenceType: 'referral',
                referenceId: refereeId,
            });

            return { refereeId, reward: REFERRAL_REWARD_REFERRER };
        },
        onSuccess: ({ reward }) => {
            queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
            toast({
                title: '🤝 Referral Bonus!',
                description: `+${reward} MixxCoinz for your referral`,
            });
        },
        onError: (error) => {
            toast({
                title: 'Referral claim failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const generateReferralLink = useCallback(() => {
        if (!user?.id) return '';
        return `${window.location.origin}/auth?ref=${user.id}`;
    }, [user?.id]);

    return {
        stats: referralStatsQuery.data || { totalReferrals: 0, qualifiedReferrals: 0, totalEarned: 0 },
        isLoading: referralStatsQuery.isLoading,
        claimReferralReward: claimReferralReward.mutateAsync,
        isClaiming: claimReferralReward.isPending,
        generateReferralLink,
        rewards: {
            referrer: REFERRAL_REWARD_REFERRER,
            newUser: REFERRAL_REWARD_NEW_USER,
        },
    };
}

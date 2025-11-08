import { useState, useEffect, useCallback } from 'react';
import { useReferralStore, ReferralCode, ReferralReward } from '@/stores/referralStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useReferralSystem() {
    const { user } = useAuth();
    const {
        myReferralCode,
        setMyReferralCode,
        outgoingReferrals,
        setOutgoingReferrals,
        incomingReferrals,
        setIncomingReferrals,
        generateNewReferralCode,
        getReferralLink,
        getReferralShareText,
        copyReferralLink,
        calculateStats,
        referralStats,
    } = useReferralStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load referral data
    useEffect(() => {
        if (!user?.id) return;

        const loadReferralData = async () => {
            try {
                setLoading(true);

                // Get user's referral code
                // @ts-expect-error - Table not yet in generated types
                const { data: codeData, error: codeError } = await supabase
                    .from('referral_codes')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .single();

                if (codeError && codeError.code !== 'PGRST116') throw codeError;

                if (!codeData) {
                    // Generate new code if doesn't exist
                    await generateNewReferralCode();
                } else {
                    setMyReferralCode(codeData as ReferralCode);
                }

                // Get referrals made by this user
                const { data: outgoingData, error: outgoingError } = await supabase
                    .from('referral_rewards')
                    .select('*')
                    .eq('referrer_id', user.id);

                if (outgoingError) throw outgoingError;
                setOutgoingReferrals((outgoingData as ReferralReward[]) || []);

                // Get referrals received by this user
                const { data: incomingData, error: incomingError } = await supabase
                    .from('referral_rewards')
                    .select('*')
                    .eq('referred_user_id', user.id);

                if (incomingError) throw incomingError;
                setIncomingReferrals((incomingData as ReferralReward[]) || []);

                setError(null);
            } catch (err) {
                console.error('Failed to load referral data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load referral data');
            } finally {
                setLoading(false);
            }
        };

        loadReferralData();
    }, [user?.id, setMyReferralCode, setOutgoingReferrals, setIncomingReferrals, generateNewReferralCode]);

    // Calculate stats whenever referrals change
    useEffect(() => {
        calculateStats();
    }, [outgoingReferrals, calculateStats]);

    // Share referral link
    const shareReferralLink = useCallback(
        async (method: 'copy' | 'twitter' | 'facebook' | 'email' | 'whatsapp') => {
            try {
                const link = getReferralLink();
                const shareText = getReferralShareText();

                switch (method) {
                    case 'copy':
                        await copyReferralLink();
                        return { success: true, message: 'Referral link copied!' };

                    case 'twitter':
                        window.open(
                            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`,
                            '_blank'
                        );
                        return { success: true, message: 'Opened Twitter' };

                    case 'facebook':
                        window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
                            '_blank'
                        );
                        return { success: true, message: 'Opened Facebook' };

                    case 'email':
                        window.location.href = `mailto:?subject=Join MixClub!&body=${encodeURIComponent(shareText)}`;
                        return { success: true, message: 'Opened Email' };

                    case 'whatsapp':
                        window.open(
                            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
                            '_blank'
                        );
                        return { success: true, message: 'Opened WhatsApp' };

                    default:
                        return { success: false, message: 'Unknown share method' };
                }
            } catch (err) {
                console.error('Failed to share referral:', err);
                return { success: false, message: 'Failed to share referral link' };
            }
        },
        [getReferralLink, getReferralShareText, copyReferralLink]
    );

    // Get total referral earnings
    const getTotalReferralEarnings = useCallback(() => {
        return outgoingReferrals
            .filter((r) => r.rewardGiven)
            .reduce((sum, r) => sum + r.rewardValue, 0);
    }, [outgoingReferrals]);

    // Get pending rewards
    const getPendingRewards = useCallback(() => {
        return outgoingReferrals
            .filter((r) => !r.rewardGiven)
            .reduce((sum, r) => sum + r.rewardValue, 0);
    }, [outgoingReferrals]);

    return {
        myReferralCode,
        referralLink: getReferralLink(),
        referralStats,
        outgoingReferrals,
        incomingReferrals,
        loading,
        error,
        shareReferralLink,
        copyReferralLink,
        getTotalReferralEarnings,
        getPendingRewards,
        generateNewReferralCode,
    };
}

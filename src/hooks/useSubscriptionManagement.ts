import { useState, useEffect, useCallback } from 'react';
import { useSubscriptionStore, SubscriptionTier, UserSubscription, UsageMetrics } from '@/stores/subscriptionStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useSubscriptionManagement() {
    const { user } = useAuth();
    const {
        currentSubscription,
        setCurrentSubscription,
        setUsageMetrics,
        recordUsage,
        canUseFeature,
        getUsagePercentage,
        getCurrentPlan,
    } = useSubscriptionStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load subscription data from Supabase
    useEffect(() => {
        if (!user?.id) return;

        const loadSubscription = async () => {
            try {
                setLoading(true);

                // Get subscription from user_subscriptions table
                const { data: subData, error: subError } = await supabase
                    .from('user_subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (subError && subError.code !== 'PGRST116') throw subError; // PGRST116 = no rows

                if (!subData) {
                    // Create free tier subscription if doesn't exist
                    const newSub: UserSubscription = {
                        userId: user.id,
                        tier: 'free',
                        status: 'active',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        cancelAtPeriodEnd: false,
                        autoRenew: true,
                    };

                    const { error: insertError } = await supabase
                        .from('user_subscriptions')
                        .insert([
                            {
                                user_id: user.id,
                                tier: 'free',
                                status: 'active',
                                current_period_start: newSub.currentPeriodStart.toISOString(),
                                current_period_end: newSub.currentPeriodEnd.toISOString(),
                                cancel_at_period_end: false,
                                auto_renew: true,
                            },
                        ]);

                    if (insertError) throw insertError;
                    setCurrentSubscription(newSub);
                } else {
                    // Map snake_case to camelCase
                    const mappedSub: UserSubscription = {
                        userId: subData.user_id,
                        tier: subData.tier as SubscriptionTier,
                        stripeCustomerId: subData.stripe_customer_id || undefined,
                        stripeSubscriptionId: subData.stripe_subscription_id || undefined,
                        currentPeriodStart: new Date(subData.current_period_start),
                        currentPeriodEnd: new Date(subData.current_period_end),
                        status: subData.status as 'active' | 'past_due' | 'canceled' | 'trialing',
                        cancelAtPeriodEnd: subData.cancel_at_period_end,
                        autoRenew: subData.auto_renew,
                    };
                    setCurrentSubscription(mappedSub);
                }

                // Get current month usage
                const currentMonth = new Date().toISOString().slice(0, 7);
                const { data: metricsData, error: metricsError } = await supabase
                    .from('usage_metrics')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('month', currentMonth)
                    .single();

                if (metricsError && metricsError.code !== 'PGRST116') throw metricsError;

                if (!metricsData) {
                    const newMetrics: UsageMetrics = {
                        userId: user.id,
                        month: currentMonth,
                        tracksProcessed: 0,
                        mastersCompleted: 0,
                        storageUsedGb: 0,
                        apiCallsUsed: 0,
                        engineerMatchesUsed: 0,
                    };
                    setUsageMetrics(newMetrics);
                } else {
                    // Map snake_case to camelCase
                    const mappedMetrics: UsageMetrics = {
                        userId: metricsData.user_id,
                        month: metricsData.month,
                        tracksProcessed: metricsData.tracks_processed,
                        mastersCompleted: metricsData.masters_completed,
                        storageUsedGb: Number(metricsData.storage_used_gb),
                        apiCallsUsed: metricsData.api_calls_used,
                        engineerMatchesUsed: metricsData.engineer_matches_used,
                    };
                    setUsageMetrics(mappedMetrics);
                }
            } catch (err) {
                console.error('Failed to load subscription:', err);
                setError(err instanceof Error ? err.message : 'Failed to load subscription');
            } finally {
                setLoading(false);
            }
        };

        loadSubscription();
    }, [user?.id, setCurrentSubscription, setUsageMetrics]);

    // Track feature usage
    const trackFeatureUsage = useCallback(
        async (featureType: 'track' | 'master' | 'api-call' | 'engineer-match' | 'storage', amount = 1) => {
            if (!user?.id) return false;

            try {
                // Check if feature can be used
                const featureMap: Record<typeof featureType, string> = {
                    'track': 'process-track',
                    'master': 'master-track',
                    'api-call': 'api-call',
                    'engineer-match': 'engineer-match',
                    'storage': 'add-collaborator',
                };

                if (!canUseFeature(featureMap[featureType])) {
                    setError(`You've reached your ${featureType} limit for this month. Upgrade to continue.`);
                    return false;
                }

                // Record locally
                const usageTypeMap: Record<typeof featureType, any> = {
                    'track': 'tracksProcessed',
                    'master': 'mastersCompleted',
                    'api-call': 'apiCallsUsed',
                    'engineer-match': 'engineerMatchesUsed',
                    'storage': 'storageUsedGb',
                };

                recordUsage(usageTypeMap[featureType], amount);

                // Update in Supabase directly with column names
                const currentMonth = new Date().toISOString().slice(0, 7);
                const columnNames: Record<typeof featureType, string> = {
                    'track': 'tracks_processed',
                    'master': 'masters_completed',
                    'api-call': 'api_calls_used',
                    'engineer-match': 'engineer_matches_used',
                    'storage': 'storage_used_gb',
                };

                const { data: current } = await supabase
                    .from('usage_metrics')
                    .select(columnNames[featureType])
                    .eq('user_id', user.id)
                    .eq('month', currentMonth)
                    .single();

                if (current) {
                    const currentValue = current[columnNames[featureType]] || 0;
                    const { error: updateError } = await supabase
                        .from('usage_metrics')
                        .update({
                            [columnNames[featureType]]: currentValue + amount,
                        })
                        .eq('user_id', user.id)
                        .eq('month', currentMonth);

                    if (updateError) throw updateError;
                }

                setError(null);
                return true;
            } catch (err) {
                console.error('Failed to track usage:', err);
                return false;
            }
        },
        [user?.id, canUseFeature, recordUsage]
    );

    // Upgrade subscription
    const upgradeSubscription = useCallback(
        async (newTier: SubscriptionTier) => {
            if (!user?.id || !currentSubscription) return;

            try {
                setLoading(true);

                // Call upgrade endpoint (you'll need to create this)
                const response = await fetch('/api/subscriptions/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        currentTier: currentSubscription.tier,
                        newTier,
                    }),
                });

                if (!response.ok) throw new Error('Upgrade failed');

                const updatedSub = await response.json();
                setCurrentSubscription(updatedSub);
                setError(null);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to upgrade subscription';
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [user?.id, currentSubscription, setCurrentSubscription]
    );

    // Cancel subscription
    const cancelSubscription = useCallback(async () => {
        if (!user?.id || !currentSubscription) return;

        try {
            setLoading(true);

            const response = await fetch('/api/subscriptions/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    subscriptionId: currentSubscription.stripeSubscriptionId,
                }),
            });

            if (!response.ok) throw new Error('Cancellation failed');

            const updatedSub = await response.json();
            setCurrentSubscription(updatedSub);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.id, currentSubscription, setCurrentSubscription]);

    return {
        currentSubscription,
        currentPlan: getCurrentPlan(),
        loading,
        error,
        canUseFeature,
        getUsagePercentage,
        trackFeatureUsage,
        upgradeSubscription,
        cancelSubscription,
    };
}

/**
 * Hook for subscription management with backend integration
 * Provides real-time subscription updates from Supabase
 */

import { useEffect, useState } from 'react';
import { SubscriptionService, type Subscription } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';

export function useBackendSubscription(userId: string) {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadSubscription() {
            try {
                setLoading(true);
                const sub = await SubscriptionService.getSubscription(userId);
                setSubscription(sub);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        }

        loadSubscription();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`subscription:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_subscriptions',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    setSubscription(payload.new as Subscription);
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [userId]);

    const hasFeature = async (feature: string): Promise<boolean> => {
        try {
            return await SubscriptionService.checkFeatureAccess(userId, feature);
        } catch (err) {
            console.error('Feature check failed:', err);
            return false;
        }
    };

    const trackUsage = async (count?: number): Promise<void> => {
        try {
            await SubscriptionService.trackUsage(userId, count);
        } catch (err) {
            console.error('Usage tracking failed:', err);
        }
    };

    return {
        subscription,
        loading,
        error,
        hasFeature,
        trackUsage,
    };
}

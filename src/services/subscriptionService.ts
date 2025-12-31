import { supabase } from '@/integrations/supabase/client';

/**
 * SUBSCRIPTION SERVICE - Backend Integration
 * Handles all subscription-related database operations and API calls
 */

export interface Subscription {
    id: string;
    user_id: string;
    tier: 'free' | 'starter' | 'pro' | 'studio';
    status: 'active' | 'cancelled' | 'paused';
    price_monthly: number;
    stripe_subscription_id?: string;
    features_available: string[];
    usage_limit: number;
    usage_current: number;
    created_at: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end?: boolean;
}

export const SubscriptionService = {
    /**
     * Get user's current subscription
     */
    async getSubscription(userId: string): Promise<Subscription | null> {
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Failed to fetch subscription:', error);
            return null;
        }

        return data as Subscription | null;
    },

    /**
     * Create or update subscription
     */
    async upsertSubscription(
        userId: string,
        tier: Subscription['tier'],
        stripeSubscriptionId: string
    ): Promise<Subscription> {
        const tierConfig = {
            free: { price: 0, features: ['basic_editing', 'limited_projects'] },
            starter: { price: 9, features: ['basic_editing', '10_projects', 'referral_system'] },
            pro: { price: 29, features: ['advanced_editing', 'unlimited_projects', 'ai_matching', 'marketplace'] },
            studio: { price: 99, features: ['all_features', 'priority_support', 'custom_weighting'] },
        };

        const config = tierConfig[tier];

        const { data, error } = await supabase
            .from('user_subscriptions')
            .upsert(
                {
                    user_id: userId,
                    tier,
                    status: 'active',
                    price_monthly: config.price,
                    features_available: config.features,
                    usage_limit: tier === 'free' ? 5 : 1000,
                    usage_current: 0,
                    stripe_subscription_id: stripeSubscriptionId,
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    onConflict: 'user_id',
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Failed to upsert subscription:', error);
            throw error;
        }

        return data as Subscription;
    },

    /**
     * Track usage (for rate limiting)
     */
    async trackUsage(userId: string, count: number = 1): Promise<boolean> {
        const { data, error } = await supabase.rpc('increment_usage', {
            user_id: userId,
            increment_by: count,
        });

        if (error) {
            console.error('Failed to track usage:', error);
            return false;
        }

        return true;
    },

    /**
     * Check if user can perform action based on subscription
     */
    async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
        const subscription = await this.getSubscription(userId);
        if (!subscription) return false;

        return subscription.features_available.includes(feature);
    },

    /**
     * Cancel subscription
     */
    async cancelSubscription(userId: string): Promise<boolean> {
        const { error } = await supabase
            .from('user_subscriptions')
            .update({ status: 'cancelled', cancel_at_period_end: true })
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to cancel subscription:', error);
            return false;
        }

        return true;
    },

    /**
     * Get subscription analytics
     */
    async getSubscriptionAnalytics(): Promise<{
        total_subscribers: number;
        by_tier: Record<string, number>;
        monthly_revenue: number;
        churn_rate: number;
    }> {
        const { data, error } = await supabase.rpc('get_subscription_analytics');

        if (error) {
            console.error('Failed to get analytics:', error);
            throw error;
        }

        return data;
    },
};

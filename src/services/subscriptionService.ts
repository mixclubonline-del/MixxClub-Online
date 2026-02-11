/**
 * SUBSCRIPTION SERVICE - Real Supabase Implementation
 * Queries user_subscriptions and subscription_plans tables.
 */

import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
    id: string;
    user_id: string;
    tier: 'free' | 'starter' | 'pro' | 'studio';
    status: 'active' | 'cancelled' | 'paused' | 'trialing' | 'past_due';
    price_monthly: number;
    stripe_subscription_id?: string;
    stripe_customer_id?: string;
    features_available: string[];
    usage_limit: number;
    usage_current: number;
    created_at: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end?: boolean;
}

/** Tier feature/limit config as a fallback when DB lacks detail */
const TIER_DEFAULTS: Record<string, { price: number; features: string[]; limit: number }> = {
    free: { price: 0, features: ['basic_editing', 'limited_projects'], limit: 5 },
    starter: { price: 9, features: ['basic_editing', '10_projects', 'referral_system'], limit: 100 },
    pro: { price: 29, features: ['advanced_editing', 'unlimited_projects', 'ai_matching', 'marketplace'], limit: 1000 },
    studio: { price: 99, features: ['all_features', 'priority_support', 'custom_weighting'], limit: 10000 },
};

function buildSubscription(row: Record<string, unknown>): Subscription {
    const tier = (row.tier as string) || 'free';
    const defaults = TIER_DEFAULTS[tier] || TIER_DEFAULTS.free;

    return {
        id: row.id as string,
        user_id: row.user_id as string,
        tier: tier as Subscription['tier'],
        status: (row.status as Subscription['status']) || 'active',
        price_monthly: (row.price_monthly as number) ?? defaults.price,
        stripe_subscription_id: row.stripe_subscription_id as string | undefined,
        stripe_customer_id: row.stripe_customer_id as string | undefined,
        features_available: Array.isArray(row.features_available) ? row.features_available : defaults.features,
        usage_limit: (row.usage_limit as number) ?? defaults.limit,
        usage_current: (row.usage_current as number) ?? 0,
        created_at: row.created_at as string,
        current_period_start: (row.current_period_start as string) || (row.created_at as string),
        current_period_end: (row.current_period_end as string) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: row.cancel_at_period_end as boolean | undefined,
    };
}

export const SubscriptionService = {
    /**
     * Get user's current subscription from Supabase
     */
    async getSubscription(userId: string): Promise<Subscription | null> {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('SubscriptionService.getSubscription error:', error.message);
                return buildFreeDefault(userId);
            }

            if (!data) {
                // No active subscription → return free tier
                return buildFreeDefault(userId);
            }

            return buildSubscription(data);
        } catch (err) {
            console.error('SubscriptionService.getSubscription unexpected error:', err);
            return buildFreeDefault(userId);
        }
    },

    /**
     * Create or update subscription (called after Stripe webhook confirms payment)
     */
    async upsertSubscription(
        userId: string,
        tier: Subscription['tier'],
        stripeSubscriptionId: string
    ): Promise<Subscription> {
        const defaults = TIER_DEFAULTS[tier] || TIER_DEFAULTS.free;

        const { data, error } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: userId,
                tier,
                status: 'active',
                stripe_subscription_id: stripeSubscriptionId,
                price_monthly: defaults.price,
                features_available: defaults.features,
                usage_limit: defaults.limit,
                usage_current: 0,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to upsert subscription: ${error.message}`);
        }

        return buildSubscription(data);
    },

    /**
     * Track usage (increment usage_current)
     */
    async trackUsage(userId: string, count: number = 1): Promise<boolean> {
        const sub = await this.getSubscription(userId);
        if (!sub) return true;

        const newUsage = sub.usage_current + count;

        await supabase
            .from('user_subscriptions')
            .update({ usage_current: newUsage })
            .eq('user_id', userId)
            .eq('status', 'active');

        return newUsage <= sub.usage_limit;
    },

    /**
     * Check if user can use a specific feature based on subscription
     */
    async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
        const subscription = await this.getSubscription(userId);
        if (!subscription) return false;
        return subscription.features_available.includes(feature);
    },

    /**
     * Cancel subscription (soft cancel — sets cancel_at_period_end)
     */
    async cancelSubscription(userId: string): Promise<boolean> {
        const { error } = await supabase
            .from('user_subscriptions')
            .update({
                cancel_at_period_end: true,
            })
            .eq('user_id', userId)
            .eq('status', 'active');

        return !error;
    },

    /**
     * Get subscription analytics (admin use)
     */
    async getSubscriptionAnalytics(): Promise<{
        total_subscribers: number;
        by_tier: Record<string, number>;
        monthly_revenue: number;
        churn_rate: number;
    }> {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('tier, status, price_monthly');

            if (error || !data) {
                return { total_subscribers: 0, by_tier: {}, monthly_revenue: 0, churn_rate: 0 };
            }

            const active = data.filter(s => s.status === 'active');
            const cancelled = data.filter(s => s.status === 'cancelled');
            const byTier: Record<string, number> = { free: 0, starter: 0, pro: 0, studio: 0 };
            let revenue = 0;

            active.forEach(sub => {
                const tier = (sub.tier as string) || 'free';
                byTier[tier] = (byTier[tier] || 0) + 1;
                revenue += (sub.price_monthly as number) || 0;
            });

            return {
                total_subscribers: active.length,
                by_tier: byTier,
                monthly_revenue: revenue,
                churn_rate: data.length > 0 ? cancelled.length / data.length : 0,
            };
        } catch {
            return { total_subscribers: 0, by_tier: {}, monthly_revenue: 0, churn_rate: 0 };
        }
    },
};

/** Helper: build a default free-tier subscription for users with no DB record */
function buildFreeDefault(userId: string): Subscription {
    return {
        id: 'default-free',
        user_id: userId,
        tier: 'free',
        status: 'active',
        price_monthly: 0,
        features_available: TIER_DEFAULTS.free.features,
        usage_limit: TIER_DEFAULTS.free.limit,
        usage_current: 0,
        created_at: new Date().toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
}

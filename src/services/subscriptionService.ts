/**
 * SUBSCRIPTION SERVICE - Stubbed Implementation
 * The user_subscriptions table schema doesn't match the Subscription interface.
 * This provides a mock/fallback implementation.
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

// In-memory mock subscriptions
const mockSubscriptions: Map<string, Subscription> = new Map();

const DEFAULT_FREE_SUBSCRIPTION = (userId: string): Subscription => ({
    id: crypto.randomUUID(),
    user_id: userId,
    tier: 'free',
    status: 'active',
    price_monthly: 0,
    features_available: ['basic_editing', 'limited_projects'],
    usage_limit: 5,
    usage_current: 0,
    created_at: new Date().toISOString(),
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});

export const SubscriptionService = {
    /**
     * Get user's current subscription
     */
    async getSubscription(userId: string): Promise<Subscription | null> {
        console.warn('SubscriptionService: Using mock data - subscription schema mismatch');
        
        if (mockSubscriptions.has(userId)) {
            return mockSubscriptions.get(userId)!;
        }
        
        // Return a default free subscription for any user
        const defaultSub = DEFAULT_FREE_SUBSCRIPTION(userId);
        mockSubscriptions.set(userId, defaultSub);
        return defaultSub;
    },

    /**
     * Create or update subscription
     */
    async upsertSubscription(
        userId: string,
        tier: Subscription['tier'],
        stripeSubscriptionId: string
    ): Promise<Subscription> {
        console.warn('SubscriptionService: Using mock data - subscription schema mismatch');
        
        const tierConfig = {
            free: { price: 0, features: ['basic_editing', 'limited_projects'], limit: 5 },
            starter: { price: 9, features: ['basic_editing', '10_projects', 'referral_system'], limit: 100 },
            pro: { price: 29, features: ['advanced_editing', 'unlimited_projects', 'ai_matching', 'marketplace'], limit: 1000 },
            studio: { price: 99, features: ['all_features', 'priority_support', 'custom_weighting'], limit: 10000 },
        };

        const config = tierConfig[tier];
        
        const subscription: Subscription = {
            id: crypto.randomUUID(),
            user_id: userId,
            tier,
            status: 'active',
            price_monthly: config.price,
            stripe_subscription_id: stripeSubscriptionId,
            features_available: config.features,
            usage_limit: config.limit,
            usage_current: 0,
            created_at: new Date().toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        mockSubscriptions.set(userId, subscription);
        return subscription;
    },

    /**
     * Track usage (for rate limiting)
     */
    async trackUsage(userId: string, count: number = 1): Promise<boolean> {
        console.warn('SubscriptionService: Using mock data - increment_usage RPC not available');
        
        const sub = mockSubscriptions.get(userId);
        if (sub) {
            sub.usage_current += count;
            return sub.usage_current <= sub.usage_limit;
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
        console.warn('SubscriptionService: Using mock data - subscription schema mismatch');
        
        const sub = mockSubscriptions.get(userId);
        if (sub) {
            sub.status = 'cancelled';
            sub.cancel_at_period_end = true;
            return true;
        }
        return false;
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
        console.warn('SubscriptionService: Using mock data - get_subscription_analytics RPC not available');
        
        const subs = Array.from(mockSubscriptions.values());
        const byTier: Record<string, number> = { free: 0, starter: 0, pro: 0, studio: 0 };
        let revenue = 0;
        
        subs.forEach(sub => {
            if (sub.status === 'active') {
                byTier[sub.tier] = (byTier[sub.tier] || 0) + 1;
                revenue += sub.price_monthly;
            }
        });
        
        return {
            total_subscribers: subs.filter(s => s.status === 'active').length,
            by_tier: byTier,
            monthly_revenue: revenue,
            churn_rate: 0,
        };
    },
};

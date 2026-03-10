import { create } from 'zustand';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'studio';

export interface SubscriptionPlan {
    id: SubscriptionTier;
    name: string;
    price: number;
    billingPeriod: 'monthly' | 'yearly';
    description: string;
    features: string[];
    limits: {
        tracksPerMonth: number;
        mastersPerMonth: number;
        storageGb: number;
        collaborators: number;
        apiCalls: number;
        engineerMatches: number;
    };
}

export interface UserSubscription {
    userId: string;
    tier: SubscriptionTier;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    cancelAtPeriodEnd: boolean;
    autoRenew: boolean;
}

export interface UsageMetrics {
    userId: string;
    month: string; // YYYY-MM format
    tracksProcessed: number;
    mastersCompleted: number;
    storageUsedGb: number;
    apiCallsUsed: number;
    engineerMatchesUsed: number;
}

interface SubscriptionStore {
    // Current user subscription
    currentSubscription: UserSubscription | null;
    usageMetrics: UsageMetrics | null;

    // Subscription plans reference
    plans: Map<SubscriptionTier, SubscriptionPlan>;

    // Methods
    setCurrentSubscription: (subscription: UserSubscription | null) => void;
    setUsageMetrics: (metrics: UsageMetrics) => void;
    recordUsage: (type: keyof Omit<UsageMetrics, 'userId' | 'month'>, amount?: number) => void;
    canUseFeature: (featureName: string) => boolean;
    getUsagePercentage: (featureName: string) => number;
    upgradeTier: (newTier: SubscriptionTier) => Promise<void>;
    downgradeTier: (newTier: SubscriptionTier) => Promise<void>;
    cancelSubscription: () => Promise<void>;
    getCurrentPlan: () => SubscriptionPlan | null;
}

const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        billingPeriod: 'monthly',
        description: 'Perfect for getting started',
        features: [
            'Community access',
            'Portfolio building',
            'Mix battles',
            'Limited processing',
        ],
        limits: {
            tracksPerMonth: 5,
            mastersPerMonth: 1,
            storageGb: 1,
            collaborators: 1,
            apiCalls: 100,
            engineerMatches: 3,
        },
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 9,
        billingPeriod: 'monthly',
        description: 'For aspiring creators',
        features: [
            'Everything in Free +',
            '5 free track processes/month',
            '1 free master/month',
            'Basic analytics',
            'Priority in battles',
            'Community badge',
        ],
        limits: {
            tracksPerMonth: 25,
            mastersPerMonth: 5,
            storageGb: 10,
            collaborators: 3,
            apiCalls: 1000,
            engineerMatches: 15,
        },
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 29,
        billingPeriod: 'monthly',
        description: 'For serious creators',
        features: [
            'Everything in Starter +',
            '50 track processes/month',
            '10 masters/month',
            'Advanced analytics',
            '2 engineer consultations/month',
            'Priority support',
            'Early access to features',
            'Exclusive templates',
        ],
        limits: {
            tracksPerMonth: 100,
            mastersPerMonth: 20,
            storageGb: 100,
            collaborators: 10,
            apiCalls: 10000,
            engineerMatches: 50,
        },
    },
    studio: {
        id: 'studio',
        name: 'Studio',
        price: 99,
        billingPeriod: 'monthly',
        description: 'For professional studios',
        features: [
            'Everything in Pro +',
            'Unlimited tracks/masters',
            'White-label options',
            'API access',
            'Dedicated engineer',
            'Custom integrations',
            'Revenue share eligible',
            '24/7 support',
        ],
        limits: {
            tracksPerMonth: 999999,
            mastersPerMonth: 999999,
            storageGb: 1000,
            collaborators: 50,
            apiCalls: 100000,
            engineerMatches: 999,
        },
    },
};

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
    currentSubscription: null,
    usageMetrics: null,
    plans: new Map(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionTier, SubscriptionPlan][]),

    setCurrentSubscription: (subscription) => set({ currentSubscription: subscription }),

    setUsageMetrics: (metrics) => set({ usageMetrics: metrics }),

    recordUsage: (type, amount = 1) => {
        const { usageMetrics, currentSubscription } = get();

        if (!usageMetrics || !currentSubscription) return;

        const currentMonth = new Date().toISOString().slice(0, 7);
        if (usageMetrics.month !== currentMonth) {
            // Reset metrics for new month
            set({
                usageMetrics: {
                    userId: usageMetrics.userId,
                    month: currentMonth,
                    tracksProcessed: 0,
                    mastersCompleted: 0,
                    storageUsedGb: 0,
                    apiCallsUsed: 0,
                    engineerMatchesUsed: 0,
                },
            });
            return;
        }

        const updatedMetrics = { ...usageMetrics };
        if (type === 'tracksProcessed') updatedMetrics.tracksProcessed += amount;
        else if (type === 'mastersCompleted') updatedMetrics.mastersCompleted += amount;
        else if (type === 'storageUsedGb') updatedMetrics.storageUsedGb += amount;
        else if (type === 'apiCallsUsed') updatedMetrics.apiCallsUsed += amount;
        else if (type === 'engineerMatchesUsed') updatedMetrics.engineerMatchesUsed += amount;

        set({ usageMetrics: updatedMetrics });
    },

    canUseFeature: (featureName: string) => {
        const { currentSubscription, usageMetrics, plans } = get();

        if (!currentSubscription || !usageMetrics) return false;

        const plan = plans.get(currentSubscription.tier);
        if (!plan) return false;

        const limits = plan.limits;

        switch (featureName) {
            case 'process-track':
                return usageMetrics.tracksProcessed < limits.tracksPerMonth;
            case 'master-track':
                return usageMetrics.mastersCompleted < limits.mastersPerMonth;
            case 'add-collaborator':
                return usageMetrics.storageUsedGb < limits.storageGb;
            case 'api-call':
                return usageMetrics.apiCallsUsed < limits.apiCalls;
            case 'engineer-match':
                return usageMetrics.engineerMatchesUsed < limits.engineerMatches;
            default:
                return true;
        }
    },

    getUsagePercentage: (featureName: string) => {
        const { currentSubscription, usageMetrics, plans } = get();

        if (!currentSubscription || !usageMetrics) return 0;

        const plan = plans.get(currentSubscription.tier);
        if (!plan) return 0;

        const limits = plan.limits;

        let used = 0;
        let limit = 0;

        switch (featureName) {
            case 'tracks':
                used = usageMetrics.tracksProcessed;
                limit = limits.tracksPerMonth;
                break;
            case 'masters':
                used = usageMetrics.mastersCompleted;
                limit = limits.mastersPerMonth;
                break;
            case 'storage':
                used = usageMetrics.storageUsedGb;
                limit = limits.storageGb;
                break;
            case 'api':
                used = usageMetrics.apiCallsUsed;
                limit = limits.apiCalls;
                break;
            case 'matches':
                used = usageMetrics.engineerMatchesUsed;
                limit = limits.engineerMatches;
                break;
            default:
                return 0;
        }

        return limit === 0 ? 0 : (used / limit) * 100;
    },

    upgradeTier: async (_newTier) => {
        // Upgrades/downgrades are handled via Stripe Customer Portal
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data, error } = await supabase.functions.invoke('customer-portal');
            if (error) throw error;
            if (data?.url) {
                window.open(data.url, '_blank');
            }
        } catch (error) {
            console.error('Failed to open subscription management:', error);
            throw error;
        }
    },

    downgradeTier: async (_newTier) => {
        // Downgrades are handled via Stripe Customer Portal
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data, error } = await supabase.functions.invoke('customer-portal');
            if (error) throw error;
            if (data?.url) {
                window.open(data.url, '_blank');
            }
        } catch (error) {
            console.error('Failed to open subscription management:', error);
            throw error;
        }
    },

    cancelSubscription: async () => {
        // Cancellations are handled via Stripe Customer Portal
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data, error } = await supabase.functions.invoke('customer-portal');
            if (error) throw error;
            if (data?.url) {
                window.open(data.url, '_blank');
            }
        } catch (error) {
            console.error('Failed to open subscription management:', error);
            throw error;
        }
    },

    getCurrentPlan: () => {
        const { currentSubscription, plans } = get();
        if (!currentSubscription) return null;
        return plans.get(currentSubscription.tier) || null;
    },
})
);
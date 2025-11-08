/**
 * BACKEND INTEGRATION - IMPLEMENTATION EXAMPLES
 * 
 * Real-world examples of using the backend services in React components
 */

// ============================================================================
// 1. USING SUBSCRIPTION SERVICE IN COMPONENTS
// ============================================================================

import { useEffect, useState } from 'react';
import { SubscriptionService, type Subscription } from '@/services/subscriptionService';
import { supabase } from '@/services/supabaseClient';

/**
 * Hook for subscription management
 */
export function useSubscription(userId: string) {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSubscription() {
            const sub = await SubscriptionService.getSubscription(userId);
            setSubscription(sub);
            setLoading(false);
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

    return {
        subscription,
        loading,
        hasFeature: async (feature: string) => {
            return await SubscriptionService.checkFeatureAccess(userId, feature);
        },
        trackUsage: async (count?: number) => {
            return await SubscriptionService.trackUsage(userId, count);
        },
    };
}

/**
 * Component using subscription service
 */
export function SubscriptionStatus({ userId }: { userId: string }) {
    const { subscription, loading } = useSubscription(userId);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{subscription?.tier.toUpperCase()} Plan</h2>
            <div className="space-y-2">
                <p>Status: <span className="font-semibold">{subscription?.status}</span></p>
                <p>Monthly Cost: ${subscription?.price_monthly}</p>
                <p>Usage: {subscription?.usage_current} / {subscription?.usage_limit}</p>
                <div className="mt-4">
                    <div className="bg-white rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                                width: `${((subscription?.usage_current || 0) / (subscription?.usage_limit || 1)) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// 2. USING MATCHING ENGINE SERVICE IN COMPONENTS
// ============================================================================

import { MatchingEngineService, type MatchResult, type EngineerProfile } from '@/services/matchingEngineService';

export function useMatchingEngine(projectId: string) {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [engineers, setEngineers] = useState<EngineerProfile[]>([]);
    const [loading, setLoading] = useState(false);

    async function findMatches() {
        setLoading(true);
        try {
            const results = await MatchingEngineService.findMatches(projectId, 5);
            setMatches(results);
        } catch (error) {
            console.error('Failed to find matches:', error);
        } finally {
            setLoading(false);
        }
    }

    async function selectEngineer(matchId: string, engineerId: string) {
        try {
            await MatchingEngineService.acceptMatch(matchId, projectId, engineerId);
            // Update UI or redirect
        } catch (error) {
            console.error('Failed to select engineer:', error);
        }
    }

    return { matches, engineers, loading, findMatches, selectEngineer };
}

/**
 * Component to display match results
 */
export function MatchResults({ projectId }: { projectId: string }) {
    const { matches, loading, findMatches, selectEngineer } = useMatchingEngine(projectId);

    useEffect(() => {
        findMatches();
    }, [projectId]);

    if (loading) return <div>Finding matches...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-bold mb-2">{match.confidence.toUpperCase()} Match</h3>
                    <div className="space-y-2">
                        <p className="text-2xl font-bold text-blue-600">{match.match_score}%</p>
                        <p className="text-sm text-gray-600">{match.reason}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Genre: {match.genre_match}%</div>
                            <div>Experience: {match.experience_score}%</div>
                            <div>Performance: {match.performance_score}%</div>
                            <div>Availability: {match.availability_score}%</div>
                        </div>
                        <button
                            onClick={() => selectEngineer(match.id, match.engineer_id)}
                            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                        >
                            Select Engineer
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// 3. USING MARKETPLACE SERVICE IN COMPONENTS
// ============================================================================

import { MarketplaceService, type MarketplaceProduct, type CartItem } from '@/services/marketplaceService';

export function useMarketplaceCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    async function checkout(buyerId: string) {
        try {
            const { client_secret, order_id } = await MarketplaceService.createOrder(buyerId, cartItems);
            // Redirect to Stripe payment
            return { client_secret, order_id };
        } catch (error) {
            console.error('Checkout failed:', error);
            throw error;
        }
    }

    return {
        cartItems,
        addItem: (product: CartItem) => setCartItems([...cartItems, product]),
        removeItem: (productId: string) =>
            setCartItems(cartItems.filter((item) => item.product_id !== productId)),
        checkout,
    };
}

/**
 * Component for marketplace products
 */
export function MarketplaceProducts({ category }: { category: string }) {
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const { cartItems, addItem } = useMarketplaceCart();

    useEffect(() => {
        async function loadProducts() {
            const items = await MarketplaceService.getProducts({
                category,
                sortBy: 'trending',
            });
            setProducts(items);
        }

        loadProducts();
    }, [category]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    <div className="p-4">
                        <h3 className="text-lg font-bold">{product.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                            <span className="text-sm text-yellow-500">⭐ {product.rating}</span>
                        </div>
                        <button
                            onClick={() =>
                                addItem({
                                    product_id: product.id,
                                    quantity: 1,
                                    price: product.price,
                                })
                            }
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// 4. PROTECTED COMPONENT EXAMPLE - FEATURE GATING
// ============================================================================

/**
 * Component that gates features based on subscription
 */
export function FeatureGated({
    feature,
    userId,
    children,
    fallback,
}: {
    feature: string;
    userId: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const { subscription } = useSubscription(userId);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        async function checkAccess() {
            const access = await SubscriptionService.checkFeatureAccess(userId, feature);
            setHasAccess(access);
        }

        checkAccess();
    }, [userId, feature]);

    if (!hasAccess) {
        return (
            fallback || (
                <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <p className="font-semibold">This feature requires a higher tier subscription</p>
                    <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded">Upgrade Now</button>
                </div>
            )
        );
    }

    return <>{children}</>;
}

// Usage:
export function AIMatchingButton({ userId }: { userId: string }) {
    return (
        <FeatureGated
            feature="ai_matching"
            userId={userId}
            fallback={<div>Upgrade to Pro to use AI Matching</div>}
        >
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Find Matching Engineers (Pro)
            </button>
        </FeatureGated>
    );
}

// ============================================================================
// 5. ANALYTICS DASHBOARD EXAMPLE
// ============================================================================

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function AnalyticsDashboard({ userId }: { userId: string }) {
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        async function loadAnalytics() {
            try {
                const matchingStats = await MatchingEngineService.getMatchingAnalytics();
                const sellerStats = await MarketplaceService.getSellerAnalytics(userId);
                const subStats = await SubscriptionService.getSubscriptionAnalytics();

                setAnalytics({ matchingStats, sellerStats, subStats });
            } catch (error) {
                console.error('Failed to load analytics:', error);
            }
        }

        loadAnalytics();
    }, [userId]);

    if (!analytics) return <div>Loading analytics...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Subscription Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Subscriptions</h3>
                <div className="space-y-2">
                    <p>Total Subscribers: {analytics.subStats.total_subscribers}</p>
                    <p>Monthly Revenue: ${analytics.subStats.monthly_revenue}</p>
                    <p>Churn Rate: {analytics.subStats.churn_rate}%</p>
                </div>
            </div>

            {/* Matching Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Matching</h3>
                <div className="space-y-2">
                    <p>Total Matches: {analytics.matchingStats.total_matches}</p>
                    <p>Success Rate: {analytics.matchingStats.match_success_rate}%</p>
                    <p>Avg Quality: {analytics.matchingStats.avg_match_quality}%</p>
                </div>
            </div>

            {/* Marketplace Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Marketplace</h3>
                <div className="space-y-2">
                    <p>Total Sales: {analytics.sellerStats.total_sales}</p>
                    <p>Earnings: ${analytics.sellerStats.total_earnings}</p>
                    <p>Products: {analytics.sellerStats.total_products}</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// 6. ERROR HANDLING & LOADING STATES
// ============================================================================

/**
 * Custom hook for API calls with loading/error states
 */
export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate = true
) {
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [value, setValue] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const execute = async () => {
        setStatus('pending');
        setValue(null);
        setError(null);

        try {
            const response = await asyncFunction();
            setValue(response);
            setStatus('success');
        } catch (error) {
            setError(error instanceof Error ? error : new Error(String(error)));
            setStatus('error');
        }
    };

    useEffect(() => {
        if (immediate) {
            execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [immediate]);

    return { execute, status, value, error };
}

/**
 * Component using error handling
 */
export function SafeMarketplaceCheckout({ userId, items }: { userId: string; items: CartItem[] }) {
    const { execute, status, error } = useAsync(
        () => MarketplaceService.createOrder(userId, items),
        false
    );

    return (
        <div>
            <button
                onClick={() => execute()}
                disabled={status === 'pending'}
                className="px-6 py-3 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {status === 'pending' ? 'Processing...' : 'Checkout'}
            </button>

            {status === 'error' && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded">
                    <p className="text-red-600 font-semibold">Error: {error?.message}</p>
                </div>
            )}

            {status === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded">
                    <p className="text-green-600 font-semibold">Checkout successful!</p>
                </div>
            )}
        </div>
    );
}

export default {
    useSubscription,
    useMatchingEngine,
    useMarketplaceCart,
    useAsync,
    SubscriptionStatus,
    MatchResults,
    MarketplaceProducts,
    FeatureGated,
    AIMatchingButton,
    AnalyticsDashboard,
    SafeMarketplaceCheckout,
};

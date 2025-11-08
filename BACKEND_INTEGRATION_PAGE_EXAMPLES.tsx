/**
 * INTEGRATION GUIDE: How to Use Backend Components in Existing Pages
 * 
 * This file provides copy-paste ready code snippets for integrating
 * the backend hooks and components into your existing pages.
 */

// ============================================================================
// 1. INTEGRATE INTO MatchingDashboard.tsx
// ============================================================================

/*
CURRENT: src/pages/MatchingDashboard.tsx uses local useMatchingEngine store

TO UPDATE:
1. Replace local state with backend hook
2. Add real-time database persistence
3. Enable multi-device sync

CHANGES:
*/

// OLD CODE (Current)
// import { useMatchingEngine } from '../hooks/useMatchingEngine';

// NEW CODE (Updated)
import { useBackendMatchingEngine } from '@/hooks/useBackendMatchingEngine';
import { SupabaseService } from '@/services/supabaseClient';

export function MatchingDashboard() {
    // Use backend hook instead of local store
    const { matches, findMatches, selectEngineer, loading, error } =
        useBackendMatchingEngine('project-1');

    // Get projectId from route/context in real implementation
    useEffect(() => {
        findMatches(10); // Find top 10 matches
    }, []);

    if (error) {
        return <div className="p-6 bg-red-50 rounded-lg">Error: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">AI Matching Engine</h1>
                <p className="text-gray-600">Find the perfect engineer for your project</p>
            </div>

            {/* Matches Grid */}
            {loading ? (
                <div className="text-center">Loading matches...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((match) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            onSelect={() => selectEngineer(match.id, match.engineer_id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// 2. INTEGRATE INTO Dashboard.tsx
// ============================================================================

/*
ADD subscription status and analytics
*/

import { SubscriptionStatus, FeatureGated, AnalyticsDashboard } from '@/backend-integration';
import { useAuth } from '@/hooks/useAuth';

export function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8 p-6">
            {/* Subscription Status - Shows at top */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Your Subscription</h2>
                <SubscriptionStatus userId={user?.id} />
            </section>

            {/* Feature Locked Content */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Advanced Features</h2>
                <FeatureGated
                    feature="analytics"
                    userId={user?.id}
                    requiredTier="pro"
                >
                    <AnalyticsDashboard userId={user?.id} />
                </FeatureGated>
            </section>
        </div>
    );
}

// ============================================================================
// 3. INTEGRATE INTO MarketplaceHub.tsx
// ============================================================================

/*
CURRENT: src/pages/MarketplaceHub.tsx shows products from store

TO UPDATE:
1. Add backend marketplace products
2. Add shopping cart from hook
3. Connect to Stripe checkout
*/

import { MarketplaceProducts, useBackendMarketplaceCart } from '@/backend-integration';
import { useAuth } from '@/hooks/useAuth';

export function MarketplaceHub() {
    const { user } = useAuth();
    const { cartItems, checkout, getTotalPrice, loading } =
        useBackendMarketplaceCart(user?.id);

    const handleCheckout = async () => {
        const result = await checkout();
        if (result) {
            // Initialize Stripe payment
            window.location.href = result.client_secret;
        }
    };

    return (
        <div className="grid grid-cols-4 gap-6">
            {/* Products Grid */}
            <div className="col-span-3">
                <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
                <MarketplaceProducts
                    userId={user?.id}
                    category="audio-plugins"
                    sortBy="trending"
                />
            </div>

            {/* Cart Sidebar */}
            <div className="col-span-1 bg-white rounded-lg p-6 h-fit sticky top-6">
                <h2 className="text-xl font-bold mb-4">Cart</h2>
                <div className="space-y-2 mb-4">
                    {cartItems.map(item => (
                        <div key={item.product_id} className="flex justify-between">
                            <span>{item.product_id}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                </div>
                <button
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Checkout'}
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// 4. INTEGRATE INTO AdminAnalytics.tsx (NEW PAGE)
// ============================================================================

/*
CREATE: src/pages/AdminAnalytics.tsx
Shows comprehensive analytics dashboard
*/

import { AnalyticsDashboard } from '@/backend-integration';
import { useAuth } from '@/hooks/useAuth';

export function AdminAnalytics() {
    const { user } = useAuth();

    // In real app, verify admin role
    if (!user?.is_admin) {
        return <NotAuthorized />;
    }

    return (
        <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-4xl font-bold">Admin Analytics</h1>
                <p className="text-gray-600">Platform-wide metrics and insights</p>
            </div>

            <AnalyticsDashboard userId={user.id} />

            {/* Additional Admin Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminUsersCard />
                <AdminRevenueCard />
            </div>
        </div>
    );
}

// ============================================================================
// 5. INTEGRATE INTO EngineerProfile.tsx
// ============================================================================

/*
ADD: Feature-gated premium profile sections
*/

import { FeatureGated, useBackendSubscription } from '@/backend-integration';

export function EngineerProfile({ engineerId }: Props) {
    const { subscription } = useBackendSubscription(engineerId);

    return (
        <div className="space-y-6">
            {/* Public Profile */}
            <PublicProfileSection />

            {/* Premium Analytics - Only for Studio+ tier */}
            <FeatureGated
                feature="engineer_analytics"
                userId={engineerId}
                requiredTier="studio"
            >
                <EngineerAnalyticsSection engineerId={engineerId} />
            </FeatureGated>

            {/* Premium Network - Only for Pro+ tier */}
            <FeatureGated
                feature="engineer_network"
                userId={engineerId}
                requiredTier="pro"
            >
                <EngineerNetworkSection engineerId={engineerId} />
            </FeatureGated>
        </div>
    );
}

// ============================================================================
// 6. INTEGRATE INTO Settings.tsx
// ============================================================================

/*
ADD: Subscription management in settings
*/

import { SubscriptionStatus, useBackendSubscription } from '@/backend-integration';

export function SettingsPage() {
    const { user } = useAuth();
    const { subscription, trackUsage } = useBackendSubscription(user?.id);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            {/* Subscription Settings */}
            <section className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Subscription</h2>
                <SubscriptionStatus userId={user?.id} />

                <div className="mt-6 space-y-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                        Change Plan
                    </button>
                    <button className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg">
                        Cancel Subscription
                    </button>
                </div>
            </section>

            {/* Other Settings */}
            <AccountSettingsSection />
            <SecuritySettingsSection />
        </div>
    );
}

// ============================================================================
// 7. USAGE PATTERN: Generic useAsync for Custom Operations
// ============================================================================

/*
Use useAsync for any async operation throughout your app
*/

import { useAsync } from '@/backend-integration';
import { SupabaseService } from '@/services/supabaseClient';

// Example: Custom data fetching
function CustomDataPage() {
    const { execute, status, value, error, reset } = useAsync(
        async () => {
            // Any async operation
            const response = await SupabaseService.callEdgeFunction('custom-function', {
                param: 'value'
            });
            return response;
        },
        true // Execute immediately
    );

    return (
        <div>
            {status === 'pending' && <Loading />}
            {status === 'error' && <Error message={error?.message} />}
            {status === 'success' && <Data value={value} />}
        </div>
    );
}

// ============================================================================
// SUMMARY: Migration Checklist
// ============================================================================

/*
To integrate all backend components into your app:

1. MatchingDashboard.tsx
   - Replace useMatchingEngine hook with useBackendMatchingEngine
   - Connect to real database
   - Enable multi-device sync
   
2. Dashboard.tsx
   - Add <SubscriptionStatus />
   - Add <FeatureGated /> wrappers
   - Add <AnalyticsDashboard /> if admin

3. MarketplaceHub.tsx
   - Replace local state with useBackendMarketplaceCart
   - Add <MarketplaceProducts /> component
   - Connect checkout to Stripe

4. Create AdminAnalytics.tsx
   - Add <AnalyticsDashboard />
   - Verify admin role

5. EngineerProfile.tsx
   - Wrap premium sections with <FeatureGated />
   - Use feature tier matching

6. Settings.tsx
   - Add <SubscriptionStatus />
   - Add plan change buttons
   - Add cancellation option

7. Throughout app
   - Use useAsync for any API calls
   - Import from @/backend-integration
   - Handle loading/error states

Total Lines Added: ~500-800 lines of integration
Time to Complete: ~30 minutes
Difficulty: Easy - Copy/paste ready code
*/

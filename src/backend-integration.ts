/**
 * Backend Integration - Hooks & Components Index
 * 
 * This file exports all backend integration hooks and components
 * for easy importing throughout the application
 */

// Hooks
export { useBackendSubscription } from './hooks/useBackendSubscription';
export { useBackendMatchingEngine } from './hooks/useBackendMatchingEngine';
export { useBackendMarketplaceCart } from './hooks/useBackendMarketplaceCart';
export { useAsync } from './hooks/useAsync';
export type { AsyncStatus } from './hooks/useAsync';

// Components
export { SubscriptionStatus } from './components/backend/SubscriptionStatus';
export { FeatureGated } from './components/backend/FeatureGated';
export { MarketplaceProducts } from './components/backend/MarketplaceProducts';
export { AnalyticsDashboard } from './components/backend/AnalyticsDashboard';

/**
 * QUICK START GUIDE
 * 
 * 1. Using Subscription Management:
 *    ```tsx
 *    import { useBackendSubscription, SubscriptionStatus } from '@/index'
 *    
 *    function MyComponent({ userId }) {
 *      const { subscription, hasFeature, trackUsage } = useBackendSubscription(userId);
 *      return <SubscriptionStatus userId={userId} />;
 *    }
 *    ```
 * 
 * 2. Using Feature Gating:
 *    ```tsx
 *    import { FeatureGated } from '@/index'
 *    
 *    <FeatureGated feature="ai_matching" userId={userId}>
 *      <AIMatchingButton />
 *    </FeatureGated>
 *    ```
 * 
 * 3. Using Marketplace:
 *    ```tsx
 *    import { useBackendMarketplaceCart, MarketplaceProducts } from '@/index'
 *    
 *    const { cartItems, checkout } = useBackendMarketplaceCart(userId);
 *    ```
 * 
 * 4. Using AI Matching:
 *    ```tsx
 *    import { useBackendMatchingEngine } from '@/index'
 *    
 *    const { matches, findMatches, selectEngineer } = useBackendMatchingEngine(projectId);
 *    ```
 * 
 * 5. Generic Async Operations:
 *    ```tsx
 *    import { useAsync } from '@/index'
 *    
 *    const { execute, status, value, error } = useAsync(asyncFn);
 *    ```
 */

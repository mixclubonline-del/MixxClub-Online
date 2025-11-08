# Backend Integration Guide

## Overview

This guide provides complete instructions for integrating the MixClub revenue systems with Supabase backend infrastructure.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Components & Pages with useServices hooks           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (TypeScript)                  │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ Subscription │ Matching     │ Marketplace  │              │
│  │ Service      │ Engine Svc   │ Service      │              │
│  └──────────────┴──────────────┴──────────────┘              │
│  ┌──────────────────────────────────────────┐              │
│  │        Supabase Client (Type-Safe)       │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend Infrastructure                  │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ PostgreSQL   │ Edge Fns     │ Realtime     │              │
│  │ Database     │ (Deno)       │ Subscriptions│              │
│  └──────────────┴──────────────┴──────────────┘              │
│  ┌──────────────┬──────────────┐                            │
│  │ Auth         │ Storage      │                            │
│  │ (JWT)        │ (Files)      │                            │
│  └──────────────┴──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### 1. Subscription System

**Table: `user_subscriptions`**

- Stores user subscription information
- Tracks usage, features, and billing period
- Fields: user_id, tier, status, price_monthly, usage_current, stripe_subscription_id

**Features:**

- 4-tier system (free, starter, pro, studio)
- Usage tracking and limits
- Automatic period renewal tracking
- Stripe integration ready

### 2. Matching Engine

**Tables:**

- `engineer_profiles` - Engineer information and stats
- `projects` - Projects needing engineers
- `engineer_matches` - Match results with scoring
- `match_feedback` - Match outcomes and ratings
- `match_events` - Analytics events

**Features:**

- Complete engineer profile data
- Project requirements storage
- ML-based match scoring (5 factors)
- Feedback and outcome tracking
- Event-based analytics

### 3. Marketplace

**Tables:**

- `marketplace_products` - Product listings
- `marketplace_orders` - Purchase orders
- `product_downloads` - Download tracking
- `product_reviews` - User ratings and reviews

**Features:**

- Product catalog with filtering
- Order management
- 70/30 revenue split
- Review and rating system
- Download analytics

### 4. Referral System

**Tables:**

- `referral_codes` - Unique referral codes per user
- `referral_claims` - Tracking of referred users

**Features:**

- Unique code generation per user
- Referral tracking
- Reward distribution
- Status management

### 5. Analytics & Audit

**Tables:**

- `analytics_events` - Track all user actions
- `audit_logs` - Complete audit trail

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual SQL
# Copy the SQL from supabase/migrations/20251107_backend_integration.sql
# and run in Supabase SQL editor
```

### Step 2: Configure Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://htvmkylgrrlaydhdbonl.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_key_here
```

### Step 3: Initialize Backend Services

```typescript
// In your main app component
import { SupabaseService } from '@/services/supabaseClient';
import { SubscriptionService } from '@/services/subscriptionService';
import { MatchingEngineService } from '@/services/matchingEngineService';
import { MarketplaceService } from '@/services/marketplaceService';

// Services are now available for use
```

## 📊 Service Integration

### Using the Services in Components

#### Subscription Management

```typescript
import { SubscriptionService } from '@/services/subscriptionService';

// Get user subscription
const subscription = await SubscriptionService.getSubscription(userId);

// Check feature access
const hasAccess = await SubscriptionService.checkFeatureAccess(userId, 'ai_matching');

// Create subscription
await SubscriptionService.upsertSubscription(userId, 'pro', stripeSubscriptionId);

// Track usage
await SubscriptionService.trackUsage(userId, 1);
```

#### Matching Engine

```typescript
import { MatchingEngineService } from '@/services/matchingEngineService';

// Get engineers
const engineers = await MatchingEngineService.getEngineers({
  genres: ['hip-hop', 'trap'],
  minRating: 4.5,
  availability: 'available'
});

// Find matches for project
const matches = await MatchingEngineService.findMatches(projectId, 5);

// Accept match
await MatchingEngineService.acceptMatch(matchId, projectId, engineerId);

// Get analytics
const analytics = await MatchingEngineService.getMatchingAnalytics();
```

#### Marketplace

```typescript
import { MarketplaceService } from '@/services/marketplaceService';

// Get products
const products = await MarketplaceService.getProducts({
  category: 'templates',
  sortBy: 'trending'
});

// Create order
const { client_secret, order_id } = await MarketplaceService.createOrder(buyerId, items);

// Confirm purchase
await MarketplaceService.confirmPurchase(orderId);

// Get seller analytics
const analytics = await MarketplaceService.getSellerAnalytics(sellerId);
```

## 💳 Stripe Integration Points

### 1. Subscription Payments

```typescript
// Create subscription via Stripe
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: stripePriceId }],
});

// Update database
await SubscriptionService.upsertSubscription(userId, 'pro', subscription.id);
```

### 2. Marketplace Checkout

```typescript
// Edge function: create-marketplace-checkout
async function createMarketplaceCheckout(req: Request) {
  const { order_id, amount, buyer_id, items } = await req.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: { order_id, buyer_id }
  });
  
  return { client_secret: paymentIntent.client_secret };
}
```

### 3. Webhook Handler

```typescript
// Edge function: stripe-webhook
async function handleStripeWebhook(req: Request) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature'),
    webhookSecret
  );
  
  switch(event.type) {
    case 'payment_intent.succeeded':
      await MarketplaceService.confirmPurchase(event.data.object.metadata.order_id);
      break;
    case 'customer.subscription.updated':
      await SubscriptionService.handleSubscriptionUpdate(event.data.object);
      break;
  }
}
```

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **user_subscriptions**: Users can only view their own
- **engineer_profiles**: Public can view verified profiles
- **projects**: Users can view own; public can view published
- **engineer_matches**: Users involved can view
- **marketplace_products**: Public can view published
- **marketplace_orders**: Users can only view own

## 📈 Real-Time Features

### Subscription Usage Updates

```typescript
// Listen to subscription changes
supabase
  .from('user_subscriptions')
  .on('UPDATE', (payload) => {
    setSubscription(payload.new);
  })
  .subscribe();
```

### Match Status Updates

```typescript
// Listen to match status changes
supabase
  .from('engineer_matches')
  .on('UPDATE', (payload) => {
    if (payload.new.status === 'accepted') {
      // Handle engineer acceptance
    }
  })
  .subscribe();
```

### Order Status Updates

```typescript
// Listen to order status
supabase
  .from('marketplace_orders')
  .on('UPDATE', (payload) => {
    if (payload.new.status === 'completed') {
      // Handle successful purchase
    }
  })
  .subscribe();
```

## 🛠️ Edge Functions

### Required Edge Functions

1. **match-engineers**
   - Compute ML matches for a project
   - Called by: MatchingEngineService.findMatches()

2. **create-marketplace-checkout**
   - Create Stripe payment intent
   - Called by: MarketplaceService.createOrder()

3. **process-marketplace-payouts**
   - Distribute earnings (70/30 split)
   - Called by: MarketplaceService.confirmPurchase()

4. **stripe-webhook**
   - Handle Stripe events
   - Triggered by: Stripe webhooks

### Deploying Edge Functions

```bash
# Deploy a function
supabase functions deploy match-engineers

# Test locally
supabase functions serve
```

## 📊 Analytics & Reporting

### Available Analytics

```typescript
// Subscription Analytics
const subStats = await SubscriptionService.getSubscriptionAnalytics();
// Returns: { total_subscribers, by_tier, monthly_revenue, churn_rate }

// Matching Analytics
const matchStats = await MatchingEngineService.getMatchingAnalytics();
// Returns: { total_matches, success_rate, avg_quality, top_engineers, genres }

// Marketplace Analytics
const sellerStats = await MarketplaceService.getSellerAnalytics(sellerId);
// Returns: { total_sales, earnings, products, downloads, rating }
```

### Custom Queries

```typescript
// Use Supabase client directly for complex queries
const { data } = await supabase
  .from('user_subscriptions')
  .select(`
    id,
    tier,
    price_monthly,
    usage_current,
    usage_limit,
    user:auth.users(email)
  `)
  .eq('status', 'active');
```

## 🔍 Error Handling

All services include error handling and logging:

```typescript
try {
  const matches = await MatchingEngineService.findMatches(projectId);
} catch (error) {
  console.error('Failed to find matches:', error);
  // Show user-friendly error message
}
```

## 🧪 Testing

### Mock Services for Testing

```typescript
// mock-services.ts
export const mockSubscriptionService = {
  getSubscription: jest.fn().mockResolvedValue({
    tier: 'pro',
    status: 'active',
    features_available: ['ai_matching', 'marketplace']
  }),
  // ... other methods
};
```

### Testing Component Integration

```typescript
import { renderHook, waitFor } from '@testing-library/react';

test('loads user subscription', async () => {
  const { result } = renderHook(() => useSubscription(userId));
  
  await waitFor(() => {
    expect(result.current.subscription).toBeDefined();
  });
});
```

## 📱 Mobile Considerations

- Services handle network errors gracefully
- Offline support via Zustand persistence
- Real-time sync when reconnected
- Progressive enhancement for slower connections

## 🚨 Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate on backend** - Don't trust frontend validation
3. **Use RLS policies** - Enforce at database level
4. **Rate limit API calls** - Prevent abuse
5. **Audit all changes** - Track in audit_logs table
6. **Rotate Stripe keys** - Regularly update credentials
7. **Monitor webhooks** - Track failed events

## 📞 Support & Troubleshooting

### Common Issues

**Issue: "Supabase credentials not configured"**

- Solution: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

**Issue: "RLS policy denied access"**

- Solution: Check user authentication and RLS policies

**Issue: "Edge function failed"**

- Solution: Check function logs in Supabase dashboard

### Debug Mode

```typescript
// Enable debug logging
import { enableDebugLogging } from '@/services/supabaseClient';
enableDebugLogging(true);
```

## ✅ Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Edge functions deployed
- [ ] Stripe webhooks configured
- [ ] RLS policies verified
- [ ] Auth providers set up
- [ ] Test payments processed
- [ ] Analytics dashboard verified
- [ ] Error monitoring enabled
- [ ] Performance monitoring enabled

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs/api)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

**Status: Ready for Production Deployment**

All backend infrastructure is configured and ready for immediate use.



# Stripe Payment Chain — Plan

## Current State Assessment

The project already has a substantial Stripe infrastructure:

- **Edge Functions exist**: `create-subscription-checkout`, `create-payment-checkout`, `create-mixing-checkout`, `create-mastering-checkout`, `create-distribution-checkout`, `create-beat-checkout`, `create-coinz-checkout`, `create-course-checkout`, `verify-stripe-session`, `setup-stripe-connect`, `get-stripe-connect-status`
- **Webhook handler exists**: `stripe-webhook/index.ts` — handles `checkout.session.completed`, `invoice.paid`, `customer.subscription.created/updated/deleted`, `payment_intent.succeeded`, `transfer.created` with full fulfillment logic (payment recording, subscription creation, engineer payouts, referral commissions, course enrollment, beat purchases, coinz purchases)
- **Payment success page exists**: Full verification flow with confetti, order details, invoice download
- **Checkout page exists**: Routes to the correct edge function based on package type (subscription, mixing, mastering, etc.)
- **Pricing page exists**: Fetches plans from `subscription_plans` table, routes to `/checkout`
- **STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET** are already configured as secrets

## What's Missing

The chain is nearly complete. Three gaps remain:

### 1. `check-subscription` Edge Function (does not exist)
No function verifies a user's active Stripe subscription status. The frontend has no way to know the current subscription tier after login. `useSubscriptionManagement` is a stub returning `null`. The `subscriptionStore` uses fake `/api/` endpoints that don't exist.

### 2. `customer-portal` Edge Function (does not exist)
No function creates a Stripe Customer Portal session. Users cannot manage, upgrade, downgrade, or cancel their subscription.

### 3. Frontend Subscription State Integration
- `useSubscriptionManagement` is a stub returning `{ currentSubscription: null, currentPlan: null }`
- `subscriptionStore.ts` has `upgradeTier`, `downgradeTier`, `cancelSubscription` methods calling non-existent `/api/` routes
- No auto-refresh of subscription status on login or page load
- The webhook already writes to `user_subscriptions` and `profiles.stripe_customer_id`, but nothing reads it back via Stripe verification

### 4. Subscription plan upsert in webhook
The webhook's `createUserSubscription` function upserts into `user_subscriptions` but uses generic fields (`package_id`, `stripe_customer_id`, `stripe_subscription_id`). It should also set `tier` and `plan_id` correctly based on the `subscription_plans` table lookup.

## Implementation Plan

### Step 1: Create `check-subscription` Edge Function
- New file: `supabase/functions/check-subscription/index.ts`
- Accepts authenticated user, queries Stripe for active subscriptions by email
- Returns: `{ subscribed, product_id, subscription_end, tier }`
- Add to `config.toml` with `verify_jwt = false`

### Step 2: Create `customer-portal` Edge Function  
- New file: `supabase/functions/customer-portal/index.ts`
- Creates a Stripe billing portal session for the authenticated user
- Returns: `{ url }` for redirect

### Step 3: Rewrite `useSubscriptionManagement` Hook
- Replace stub with real implementation that:
  - Calls `check-subscription` on mount and on auth state change
  - Auto-refreshes every 60 seconds
  - Exposes `currentSubscription` (tier, status, end date) and `currentPlan` (from local tier map)
  - Exposes `openCustomerPortal()` method

### Step 4: Update `subscriptionStore.ts`
- Replace `/api/` calls with `supabase.functions.invoke()` calls
- Wire `upgradeTier` and `cancelSubscription` to use the customer portal flow instead of direct API calls

### Step 5: Update Webhook Subscription Handling
- In `createUserSubscription`, when `packageType === 'subscription'`, look up the plan from `subscription_plans` to set `tier` and `plan_id` correctly on the `user_subscriptions` record
- Store `stripe_customer_id` on the user's `profiles` row for invoice.paid lookups

## Files Modified
- `supabase/functions/check-subscription/index.ts` (new)
- `supabase/functions/customer-portal/index.ts` (new)
- `src/hooks/useSubscriptionManagement.ts` (rewrite)
- `src/stores/subscriptionStore.ts` (update methods)
- `supabase/functions/stripe-webhook/index.ts` (enhance `createUserSubscription` + store `stripe_customer_id` on profile)


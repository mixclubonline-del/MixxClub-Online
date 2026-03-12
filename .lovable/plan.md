

# Phase 9 Sprint 3: Stripe Checkout & Subscription Enforcement

## Current State Assessment

**What's working:**
- Edge functions exist for all checkout flows: `create-subscription-checkout`, `create-beat-checkout`, `create-payment-checkout`, `create-course-checkout`, `customer-portal`, `check-subscription`, `stripe-webhook`
- `useUsageEnforcement` hook is fully implemented with tier limits (free/starter/pro/studio)
- `UsageLimitBanner` renders at 70%/90%/100% thresholds with upgrade CTAs
- `PaymentSuccess` page verifies sessions via `verify-stripe-session`
- Webhook handles checkout.session.completed, invoice.paid/failed, subscription CRUD, charge.refunded, disputes
- Beat checkout has proper 70/30 split logic

**Issues found:**

1. **subscription_plans table has NULL Stripe price IDs** — all four plans (free/starter/pro/studio) have `stripe_price_id_monthly = NULL` and `stripe_price_id_yearly = NULL`. The `create-subscription-checkout` function falls back to `price_data` (dynamic pricing) which creates orphan Stripe products on every checkout. This needs real Stripe prices.

2. **Existing Stripe products don't match platform tiers** — Current Stripe products are "Hustle/$15mo", "Grind/$49mo", "Legend/$99mo" which don't map to "Starter/$9mo", "Pro/$29mo", "Studio/$99mo". New products/prices need to be created.

3. **No "Manage Subscription" button anywhere in the UI** — `openCustomerPortal` from `useSubscriptionManagement` is never called in any component. Settings page doesn't expose subscription management.

4. **`create-beat-checkout` uses `getClaims()` which doesn't exist** — Line 47 calls `supabaseClient.auth.getClaims(token)` which is not a valid Supabase method. Should use `getUser()`.

5. **`PaymentCanceled` page exists but unchecked** — Need to verify it renders properly.

## Implementation Plan

### Task 1: Create Stripe Products & Prices for Platform Tiers

Create three new Stripe products matching the subscription_plans table:
- **Starter**: $9/mo monthly, $90/yr yearly
- **Pro**: $29/mo monthly, $290/yr yearly  
- **Studio**: $99/mo monthly, $990/yr yearly

Use `stripe--create_stripe_product_and_price` tool to create these, then update `subscription_plans` table with the real `stripe_price_id_monthly` and `stripe_price_id_yearly` values via migration.

### Task 2: Fix `create-beat-checkout` Auth Bug

Replace `supabaseClient.auth.getClaims(token)` with `supabaseClient.auth.getUser()` — the standard auth pattern used by all other edge functions.

### Task 3: Wire "Manage Subscription" into Settings/UI

Add a subscription management section to the app that:
- Shows current plan/tier from `useSubscriptionManagement`
- Has "Manage Subscription" button calling `openCustomerPortal()`
- Has "Upgrade" button linking to `/pricing`
- Accessible from user settings or account page

### Task 4: Verify Usage Enforcement Integration

Audit that `canUseFeature()` is called before gated actions:
- Project creation (already in `CreateProjectModal`) 
- Audio uploads (already in `AudioUpload`)
- AI matching calls
- Collaboration creation (already in `useProducerPartnerships`)

Add enforcement to any missing gated actions.

### Task 5: Verify Payment Success/Cancel Routes

Confirm both `/payment-success` and `/payment-canceled` handle all payment types (subscription, beat, course, mixing, mastering) and display appropriate next steps.

## Technical Details

**New Stripe prices to create:**
| Plan | Monthly Price | Yearly Price |
|------|-------------|-------------|
| Starter | $9.00 (900¢) | $90.00 (9000¢) |
| Pro | $29.00 (2900¢) | $290.00 (29000¢) |
| Studio | $99.00 (9900¢) | $990.00 (99000¢) |

**Database migration:** Update `subscription_plans` rows with real `stripe_price_id_monthly` and `stripe_price_id_yearly` values after Stripe product creation.

**Beat checkout fix:** Replace lines 46-54 in `create-beat-checkout/index.ts` with standard `getUser()` pattern.


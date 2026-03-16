

# Business Pass: Services, Payments, MixxCoinz & Payouts Audit

## Summary of Findings

After reviewing all checkout edge functions, the Stripe webhook handler, payout pipeline, MixxCoinz economy, and frontend payment flows, I found **13 issues** across 4 categories ranging from critical bugs to consistency improvements.

---

## Critical Issues

### 1. `getClaims` does not exist — Coinz checkout is broken
`create-coinz-checkout` calls `supabaseClient.auth.getClaims(token)` which is not a real Supabase JS method. Every MixxCoinz purchase attempt will throw an error. Should use `supabaseClient.auth.getUser()` like all other checkout functions.

### 2. 14 edge functions use outdated Stripe SDK + API version
These functions import `stripe@14.21.0` with `apiVersion: '2023-10-16'` while the webhook and newer functions use `stripe@18.5.0` with `apiVersion: '2025-08-27.basil'`. Mismatched API versions between checkout creation and webhook processing can cause silent field mismatches or missing metadata.

**Affected functions:** `create-mixing-checkout`, `create-mastering-checkout`, `create-distribution-checkout`, `create-addon-payment`, `create-payment-intent`, `process-engineer-payout`, `process-refund`, `setup-stripe-connect`, `create-stripe-payout`, `get-stripe-connect-status`, `release-payment`, `scheduled-payout-processor`, `financial-reconciliation`, `admin-stripe-dashboard`

### 3. All checkout functions use `price_data` instead of pre-created Stripe prices
Every checkout function (mixing, mastering, distribution, coinz, beats, courses) creates ad-hoc `price_data` objects. This means:
- No trackable products in Stripe Dashboard
- Revenue reporting in Stripe is fragmented across unnamed products
- Harder to reconcile payments with services
- Stripe best practice recommends pre-created Products and Prices

---

## Payment Flow Issues

### 4. Coinz webhook handler is not atomic
`handleCoinzPurchase` in the webhook does a read-then-update on `mixx_wallets` without row locking. Two concurrent webhook deliveries (Stripe retries) could double-credit the wallet. Should use the existing `earn_coinz` RPC or add `FOR UPDATE` locking.

### 5. No idempotency guard on webhook handlers
`handleCheckoutCompleted` inserts into `payments` without checking if that `stripe_checkout_session_id` already exists. Stripe retries the webhook on timeout, which can create duplicate payment records. Only `handlePaymentIntentSucceeded` has a dedup check.

### 6. Missing `earn_coinz` / `spend_coinz` RPC functions
The `walletStore.ts` calls `supabase.rpc('earn_coinz', ...)` and `supabase.rpc('spend_coinz', ...)`, but these RPCs are not listed in the database functions. If they don't exist, the entire wallet earn/spend flow silently fails.

---

## Payout Pipeline Issues

### 7. Payout minimum is $50 but no balance verification
`request-payout` validates `amount >= 50` but never checks if the user actually has that balance available in `engineer_earnings`. A user could request payouts exceeding their earnings.

### 8. `process-engineer-payout` uses `profiles.stripe_connect_account_id` join
The function joins `engineer_payouts` to `profiles` via `engineer_payouts_engineer_id_fkey`. If this FK doesn't exist or the column name differs, the query silently returns no results and skips all payouts.

### 9. No scheduled trigger for payout processing
`process-engineer-payout` and `scheduled-payout-processor` exist but there's no cron job or scheduled invocation configured. Payouts sit in "pending" indefinitely unless manually triggered by an admin.

---

## Consistency Issues

### 10. Duplicate checkout functions for same service
Both `create-mixing-checkout` AND `create-payment-checkout` can handle mixing package purchases. Same for mastering. The generic `create-payment-checkout` makes the specific ones redundant, but frontends may call different ones inconsistently.

### 11. CORS headers inconsistency
Some functions use `getCorsHeaders(req)` from `_shared/cors.ts`, others hardcode CORS headers inline. The hardcoded ones miss newer headers like `x-supabase-client-platform`.

### 12. Revenue split constants duplicated
`PLATFORM_FEE_PERCENTAGE = 0.30` and `ENGINEER_SHARE_PERCENTAGE = 0.70` are hardcoded in both `stripe-webhook` and `create-beat-checkout`. Should be centralized in `_shared/constants.ts`.

### 13. PaymentSuccess page doesn't handle coinz purchases
The `verify-stripe-session` function resolves package names from `mixing_packages`, `mastering_packages`, `distribution_packages`, and `subscription_plans` — but has no case for `coinz` or `beat` purchase types. Users see a generic "Purchase" label after buying coinz.

---

## Proposed Plan

### Phase 1: Critical Fixes (must-do)

| Fix | File | Change |
|-----|------|--------|
| Fix `getClaims` bug | `create-coinz-checkout/index.ts` | Replace with `supabaseClient.auth.getUser()` |
| Add idempotency to webhook | `stripe-webhook/index.ts` | Check for existing `stripe_checkout_session_id` before insert |
| Make coinz credit atomic | `stripe-webhook/index.ts` | Use row-level locking or RPC for wallet update |
| Verify `earn_coinz`/`spend_coinz` RPCs exist | Database migration | Create if missing |

### Phase 2: Stripe Standardization

| Fix | Files | Change |
|-----|-------|--------|
| Upgrade 14 functions to `stripe@18.5.0` + `2025-08-27.basil` | All 14 listed above | Update imports and apiVersion |
| Centralize platform fee constants | `_shared/constants.ts` | Export `PLATFORM_FEE_PERCENTAGE`, `ENGINEER_SHARE_PERCENTAGE` |
| Standardize CORS | All checkout functions | Use `getCorsHeaders(req)` everywhere |

### Phase 3: Payout & Verification Hardening

| Fix | File | Change |
|-----|------|--------|
| Add balance check to `request-payout` | `request-payout/index.ts` | Query `engineer_earnings` sum before accepting |
| Add coinz/beat labels to `verify-stripe-session` | `verify-stripe-session/index.ts` | Handle `coinz` and `beat` package types |
| Consolidate duplicate checkout functions | Remove specific functions | Route all through `create-payment-checkout` or keep only the specific ones with clear separation |

### Files to Modify
- `supabase/functions/create-coinz-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/_shared/constants.ts` (new)
- `supabase/functions/verify-stripe-session/index.ts`
- `supabase/functions/request-payout/index.ts`
- 14 functions for Stripe version upgrade
- Database migration for `earn_coinz`/`spend_coinz` RPCs if missing


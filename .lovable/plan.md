

# Payment & Revenue System — Audit Plan

## Current State

The payment infrastructure is extensive:
- **Stripe Checkout**: Unified `create-payment-checkout` for mastering/mixing/distribution/addon, separate `create-subscription-checkout` for platform plans, `create-beat-checkout` for beats, `create-coinz-checkout` for MixxCoinz, `create-course-checkout` for courses
- **Webhook handler**: 1,092-line `stripe-webhook` handling checkout.completed, invoice.paid, subscription lifecycle, refunds, disputes, transfers
- **Subscription management**: `check-subscription` edge function, `useSubscriptionManagement` hook with auto-refresh, customer portal integration
- **Payouts**: Engineer payout pipeline via `process-engineer-payout` with Stripe Connect transfers
- **Admin**: `AdminRevenueHub` with charts, reconciliation, CSV/JSON export, Stripe command center
- **Success page**: `PaymentSuccess.tsx` with session verification, confetti, invoice PDF generation

## Gaps Found

| # | Issue | Impact |
|---|-------|--------|
| 1 | No user-facing payment history page — users can only see payments scattered across CRM hubs; no unified "My Payments" or "Billing" page | Users can't find receipts, track spending, or dispute charges |
| 2 | `process-refund` edge function uses `transaction_id` column on payments, but the webhook stores `stripe_payment_intent_id` — field name mismatch means refunds from the admin UI will fail | Admin refunds are silently broken |
| 3 | Subscription status stored in 3 places: `useSubscriptionManagement` (edge function), `useUserSubscription` (DB query), and `subscriptionStore` (Zustand) — none share state | Race conditions, stale tier display, triple Stripe API calls |
| 4 | No retry logic for failed engineer payouts — `process-engineer-payout` marks as "failed" and moves on | Engineers lose money on transient Stripe errors |
| 5 | Webhook `create_notification` calls use the old unwrapped function instead of `create_notification_checked` | Notifications ignore user preferences set in the previous phase |
| 6 | No Stripe Connect onboarding status check — engineers see the "Set up payouts" button but no indication of whether their account is verified, pending, or has issues | Engineers don't know if they can receive money |

## Plan

### 1. Create user-facing Billing page
- Create `src/pages/Billing.tsx` — tabbed page with:
  - **Subscription** tab: current plan, usage meters, upgrade/manage buttons (using existing `useSubscriptionManagement`)
  - **Payment History** tab: paginated list from `payments` table filtered by current user, with status badges, amounts, dates, and "Download Invoice" per row (reuse PDF generator from PaymentSuccess)
  - **Payout History** tab (engineers only): list from `engineer_payouts` filtered by current user, with transfer status
- Add route to router, add "Billing" link to sidebar/settings

### 2. Fix refund field name mismatch
- In `process-refund/index.ts`, change `payment.transaction_id` to `payment.stripe_payment_intent_id`
- This is a one-line fix but critical — admin refunds currently throw "Missing payment intent"

### 3. Consolidate subscription state
- Remove `subscriptionStore.ts` Zustand store (320 lines of duplicated state)
- Make `useSubscriptionManagement` the single source of truth — it already calls `check-subscription`, auto-refreshes, and listens to auth changes
- Update any components importing from `subscriptionStore` to use `useSubscriptionManagement` instead
- Keep `useUserSubscription` (DB-only query) as a lightweight fallback for components that only need the tier string

### 4. Add payout retry logic
- In `process-engineer-payout`, when a transfer fails, set status to `retry_pending` instead of `failed` (for transient errors like network timeouts)
- Add a `retry_count` column and `next_retry_at` timestamp to `engineer_payouts`
- Cap retries at 3 — after that, set to `failed` and notify admin
- The existing scheduled processor will pick up `retry_pending` payouts on next run

### 5. Update webhook notification calls
- In `stripe-webhook/index.ts`, replace all `create_notification(` calls with `create_notification_checked(` so that delivery respects user preferences
- Affects: subscription canceled, payment failed, coinz purchase, course enrollment, payout completed, referral commission, dispute alerts

### 6. Add Stripe Connect status indicator
- Create `useStripeConnectStatus` hook that calls `get-stripe-connect-status` edge function
- Show a status badge in the Engineer CRM revenue tab: "Not Set Up" (red), "Pending Verification" (yellow), "Active" (green), "Issues" (red with details)
- Add "Complete Setup" CTA for incomplete accounts that calls `setup-stripe-connect`

## Execution Order

```text
1. Fix refund field mismatch     (critical bug, one-line fix)
2. Update webhook notifications  (consistency with preferences system)
3. Consolidate subscription state (cleanup, reduces confusion)
4. Create Billing page           (major UX gap)
5. Payout retry logic            (reliability improvement)
6. Stripe Connect status         (engineer UX)
```

## Database Migration
- Add `retry_count INTEGER DEFAULT 0` and `next_retry_at TIMESTAMPTZ` to `engineer_payouts`

## Files Created
- `src/pages/Billing.tsx`
- `src/hooks/useStripeConnectStatus.ts`

## Files Modified
- `supabase/functions/process-refund/index.ts` — fix field name
- `supabase/functions/stripe-webhook/index.ts` — use `create_notification_checked`
- `supabase/functions/process-engineer-payout/index.ts` — retry logic
- `src/routes/appRoutes.tsx` — add `/billing` route
- `src/components/AppSidebar.tsx` — add Billing link
- `src/components/crm/RevenueHub.tsx` — add Connect status indicator
- Components importing `subscriptionStore` — migrate to `useSubscriptionManagement`

## Files Deleted
- `src/stores/subscriptionStore.ts` (replaced by existing hook)


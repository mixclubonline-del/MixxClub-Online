

# Better Stripe Integration in Admin Dashboard

## Current State

The Admin Revenue Hub (`AdminRevenueHub.tsx`) currently reads from the **local database only** — `payments`, `engineer_payouts`, and `admin_security_events` tables. It has no direct connection to Stripe's live API. The `financial-reconciliation` edge function also only queries the DB without cross-referencing Stripe.

You have a comprehensive Stripe webhook (`stripe-webhook`) that handles 10+ event types, and ~15 Stripe-related edge functions (checkouts, payouts, subscriptions, Connect). But the admin dashboard can't see live Stripe state — balance, recent charges, disputes, or subscription health.

**Note:** Your Stripe secret key needs to be updated before any live Stripe features will work. I'll prompt you to enter it during implementation.

## What We're Building

A new **Stripe Command Center** tab in the Admin Revenue Hub that provides:

1. **Live Stripe Dashboard** — Real-time balance, recent charges, active disputes, and subscription metrics fetched directly from Stripe's API
2. **Quick Actions** — Issue refunds, resolve disputes, and manage subscriptions without leaving the admin panel
3. **Enhanced Reconciliation** — Upgrade the existing reconciliation to actually cross-reference Stripe charges against DB records
4. **Subscription Analytics** — MRR tracking, churn rate, and subscriber breakdown by tier

## Implementation

### Task 1: Create `admin-stripe-dashboard` Edge Function

New backend function that queries Stripe's API and returns a unified dashboard payload:

- `GET` → Returns: Stripe balance, last 20 charges, active disputes, subscription stats (active count, MRR, churn), recent payouts
- `POST` with `action` field for quick actions:
  - `refund` — issue a refund for a payment intent
  - `resolve_dispute` — submit evidence/accept a dispute
  - `cancel_subscription` — cancel a sub

Uses admin auth (`requireAdmin`) and the existing `STRIPE_SECRET_KEY`.

### Task 2: Create `useAdminStripe` Hook

- Fetches from `admin-stripe-dashboard` on mount
- Provides `refund()`, `resolveDispute()`, `cancelSubscription()` action methods
- Auto-refresh every 60 seconds
- Loading/error states

### Task 3: Add "Stripe" Tab to `AdminRevenueHub`

New tab alongside Overview/Transactions/Payouts/Reconciliation:

- **Balance Card** — Available and pending balance from Stripe
- **Live Charges Table** — Last 20 charges with status, amount, customer email, refund button
- **Active Disputes Panel** — Open disputes with amount at risk, reason, respond button
- **Subscription Health** — Active subs count, MRR, subscriber breakdown pie chart by tier (Starter/Pro/Studio)
- **Refund Dialog** — Modal to confirm refund amount and reason before executing

### Task 4: Upgrade Reconciliation

Update `financial-reconciliation` to also fetch recent Stripe charges and cross-match against the `payments` table by `stripe_checkout_session_id`, flagging mismatches (amount differences, missing records in either system).

## File Impact

- **Create**: `supabase/functions/admin-stripe-dashboard/index.ts`
- **Create**: `src/hooks/useAdminStripe.ts`
- **Edit**: `src/components/admin/AdminRevenueHub.tsx` (add Stripe tab + UI)
- **Edit**: `supabase/functions/financial-reconciliation/index.ts` (cross-reference Stripe)

## Technical Notes

- The Stripe secret key will need to be re-entered (current one is flagged as invalid)
- All Stripe API calls happen server-side in the edge function — no Stripe SDK on the client
- Quick actions use confirmation dialogs to prevent accidental refunds/cancellations
- Dispute evidence submission uses Stripe's `update dispute` endpoint




# Stripe Revenue Backend — Schema + Function Alignment

## Problem

The Stripe revenue edge functions are fully built but the database tables are missing critical columns they try to write to. This causes silent failures on every webhook event, checkout completion, and payout operation.

## Gaps Found

### 1. `payments` table — Missing 8 columns
The webhook writes `stripe_checkout_session_id`, `stripe_customer_id`, `stripe_payment_intent_id`, `payment_type`, `package_type`, `package_id`, `completed_at`, `refund_amount`, `refund_reason`, `refunded_at`. The table only has `stripe_payment_id` (different name) and none of the others.

### 2. `profiles` table — Missing `stripe_customer_id`
The webhook and `check-subscription` function both read/write `stripe_customer_id` on profiles. Only `stripe_connect_account_id` exists.

### 3. `payout_requests` table — Missing columns
Functions reference `engineer_id` and `stripe_transfer_id` but the table has `user_id` instead and no transfer ID column.

### 4. `launch_metrics` table — Does not exist
The `predict-revenue` function queries this table. Need to create it.

### 5. Webhook missing event handlers
`charge.refunded`, `invoice.payment_failed`, and `charge.dispute.created` are not handled. Refunds processed via `process-refund` won't sync back if initiated from Stripe dashboard.

## Plan

### Step 1: Database migration — Add missing columns

```sql
-- payments table alignment
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'one_time',
  ADD COLUMN IF NOT EXISTS package_type TEXT,
  ADD COLUMN IF NOT EXISTS package_id TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- payout_requests alignment
ALTER TABLE payout_requests
  ADD COLUMN IF NOT EXISTS engineer_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;

-- launch_metrics for revenue prediction
CREATE TABLE IF NOT EXISTS launch_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL UNIQUE,
  revenue_daily NUMERIC DEFAULT 0,
  signups INTEGER DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  payments_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE launch_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read launch_metrics"
  ON launch_metrics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

### Step 2: Add missing webhook event handlers

Update `stripe-webhook/index.ts` to handle:
- `charge.refunded` — mark payment as refunded, reverse engineer earnings
- `invoice.payment_failed` — flag subscription, notify user
- `charge.dispute.created` — log dispute, alert admins

### Step 3: Add daily metrics aggregation trigger

Create a database function that runs on `payments` insert to increment `launch_metrics.revenue_daily` for the current date, keeping the prediction engine fed with real data.

### Step 4: Backfill `payout_requests.engineer_id`

Update existing rows: `UPDATE payout_requests SET engineer_id = user_id WHERE engineer_id IS NULL`

---

**Files created:** None (all edge functions exist)
**Files edited:** `supabase/functions/stripe-webhook/index.ts`
**Database changes:** 1 migration adding columns to `payments`, `profiles`, `payout_requests`, and creating `launch_metrics` table


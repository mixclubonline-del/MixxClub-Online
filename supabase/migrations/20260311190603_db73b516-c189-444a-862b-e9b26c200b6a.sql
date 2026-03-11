
-- Step 1: payments table alignment
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

-- Step 2: profiles table - stripe_customer_id
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Step 3: payout_requests alignment
ALTER TABLE payout_requests
  ADD COLUMN IF NOT EXISTS engineer_id UUID,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;

-- Step 4: launch_metrics table
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

-- Step 5: Backfill payout_requests.engineer_id from user_id
UPDATE payout_requests SET engineer_id = user_id WHERE engineer_id IS NULL;

-- Step 6: Daily metrics aggregation function
CREATE OR REPLACE FUNCTION public.aggregate_payment_to_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    INSERT INTO launch_metrics (metric_date, revenue_daily, payments_completed)
    VALUES (CURRENT_DATE, NEW.amount, 1)
    ON CONFLICT (metric_date) DO UPDATE SET
      revenue_daily = launch_metrics.revenue_daily + EXCLUDED.revenue_daily,
      payments_completed = launch_metrics.payments_completed + 1;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on payments insert
DROP TRIGGER IF EXISTS trg_aggregate_payment_metrics ON payments;
CREATE TRIGGER trg_aggregate_payment_metrics
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION aggregate_payment_to_metrics();

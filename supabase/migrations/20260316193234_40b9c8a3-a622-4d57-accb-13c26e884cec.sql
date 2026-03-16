
-- Add missing columns to user_subscriptions for full subscription lifecycle tracking
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS tier TEXT,
  ADD COLUMN IF NOT EXISTS plan_id UUID,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS price_monthly NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS features_available TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS usage_current INTEGER DEFAULT 0;

-- Backfill tier from subscription_tier for existing rows
UPDATE public.user_subscriptions SET tier = subscription_tier WHERE tier IS NULL;

-- Create a trigger to keep tier and subscription_tier in sync
CREATE OR REPLACE FUNCTION public.sync_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If tier is set but subscription_tier wasn't updated, sync it
  IF NEW.tier IS DISTINCT FROM OLD.tier AND NEW.subscription_tier = OLD.subscription_tier THEN
    NEW.subscription_tier := NEW.tier;
  END IF;
  -- If subscription_tier is set but tier wasn't updated, sync it
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier AND (NEW.tier IS NULL OR NEW.tier = OLD.tier) THEN
    NEW.tier := NEW.subscription_tier;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_subscription_tier ON public.user_subscriptions;
CREATE TRIGGER trg_sync_subscription_tier
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscription_tier();

-- Add unique constraint on user_id for upsert operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_user_id_key'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_sub_id ON public.user_subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions (status);

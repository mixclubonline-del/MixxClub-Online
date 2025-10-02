-- Add crypto payment support columns to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS crypto_charge_id TEXT,
ADD COLUMN IF NOT EXISTS crypto_charge_code TEXT,
ADD COLUMN IF NOT EXISTS crypto_payment_data JSONB;

-- Add stripe_connect_account_id to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;

-- Add stripe_transfer_id to payout_requests
ALTER TABLE public.payout_requests
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;

-- Create index on crypto_charge_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_crypto_charge_id ON public.payments(crypto_charge_id);

-- Create index on stripe_connect_account_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_connect ON public.profiles(stripe_connect_account_id);

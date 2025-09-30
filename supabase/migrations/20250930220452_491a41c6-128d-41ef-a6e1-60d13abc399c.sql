-- Add agreement tracking fields to onboarding_profiles
ALTER TABLE public.onboarding_profiles
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS artist_engineer_agreement_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS artist_engineer_agreement_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS financial_agreement_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS financial_agreement_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revenue_split_percentage NUMERIC(5,2) DEFAULT 70.00,
ADD COLUMN IF NOT EXISTS payout_preference TEXT DEFAULT 'monthly';

-- Update profiles table to ensure role can be set during signup
COMMENT ON COLUMN public.profiles.role IS 'User role: client (artist) or engineer or admin';

-- Create index for faster onboarding status queries
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_onboarding_completed 
ON public.onboarding_profiles(user_id, onboarding_completed);
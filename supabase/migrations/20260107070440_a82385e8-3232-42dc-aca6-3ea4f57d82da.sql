-- Phase D: Security Hardening (Fixed)

-- 1. Add index for faster time_tracking queries (using start_time instead of date)
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_start 
ON public.time_tracking(user_id, start_time DESC);

-- 2. Add index for faster musical_profiles lookups
CREATE INDEX IF NOT EXISTS idx_musical_profiles_user 
ON public.musical_profiles(user_id);

-- 3. Add index for payout_requests by status
CREATE INDEX IF NOT EXISTS idx_payout_requests_status 
ON public.payout_requests(user_id, status);
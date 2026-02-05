-- Add onboarding completion tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
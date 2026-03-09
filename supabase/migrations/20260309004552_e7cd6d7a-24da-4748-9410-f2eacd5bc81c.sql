-- Fix overly permissive RLS policy on funnel_events table
-- Replace "WITH CHECK (true)" with validated constraints

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can insert funnel events" ON public.funnel_events;

-- Create a new policy with validation
-- Allow inserts only for known funnel_source and step values
-- This reduces attack surface while maintaining anonymous tracking capability
CREATE POLICY "Allow validated funnel event inserts"
ON public.funnel_events
FOR INSERT
TO public
WITH CHECK (
  funnel_source IN ('immersive', 'promo', 'quick_start', 'direct', 'social', 'email', 'referral', 'organic')
  AND step IN (
    'landed', 'scene_2', 'scene_3', 'scene_4',
    'role_selected', 'auth_started', 'auth_completed',
    'demo_beat_loaded', 'demo_mastering_started', 'demo_mastering_completed',
    'pricing_viewed', 'checkout_started', 'checkout_completed',
    'profile_created', 'onboarding_completed'
  )
  AND session_id IS NOT NULL
  AND length(session_id) > 0
);
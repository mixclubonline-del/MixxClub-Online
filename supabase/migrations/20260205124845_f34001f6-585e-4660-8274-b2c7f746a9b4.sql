-- Fix RLS policies that use WITH CHECK (true) on write operations
-- These allow unrestricted inserts which is a security risk

-- 1. Fix beat_purchases: Should only be insertable by the buyer or via service role
DROP POLICY IF EXISTS "System can insert purchases" ON public.beat_purchases;
CREATE POLICY "Authenticated users can create their own purchases"
ON public.beat_purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- 2. Fix contact_submissions: Allow anyone to submit, but add rate limiting via validation
-- This is a public form, so we keep it open but ensure required fields are present
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;
CREATE POLICY "Anyone can create contact submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL 
  AND name IS NOT NULL 
  AND message IS NOT NULL
  AND length(email) <= 255
  AND length(name) <= 255
  AND length(message) <= 5000
);

-- 3. Fix profile_views: Should validate the viewer and prevent self-views
DROP POLICY IF EXISTS "Anyone can log profile views" ON public.profile_views;
CREATE POLICY "Authenticated users can log profile views"
ON public.profile_views
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = viewer_id
  AND profile_id != viewer_id
);

-- 4. Fix waitlist_signups: Allow public but validate email format
DROP POLICY IF EXISTS "Anyone can insert waitlist signup" ON public.waitlist_signups;
CREATE POLICY "Anyone can create waitlist signup with valid email"
ON public.waitlist_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL 
  AND length(email) >= 5
  AND length(email) <= 255
  AND email LIKE '%@%.%'
);
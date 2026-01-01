-- Drop existing policies and recreate with proper INSERT policy
DROP POLICY IF EXISTS "Anyone can sign up for waitlist" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Anyone can view signup counts" ON public.waitlist_signups;

-- Create proper INSERT policy for anonymous users
CREATE POLICY "Anyone can insert waitlist signup"
ON public.waitlist_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create SELECT policy for viewing counts
CREATE POLICY "Anyone can view waitlist signups"
ON public.waitlist_signups
FOR SELECT
TO anon, authenticated
USING (true);
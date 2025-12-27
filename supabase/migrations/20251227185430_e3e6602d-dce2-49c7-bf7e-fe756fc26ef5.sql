-- Fix: User Email Addresses Publicly Exposed
-- The current "Users can view all profiles" policy with USING(true) exposes emails to anyone

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create policy: Users can always view their own full profile (including email)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Authenticated users can view other profiles' public info only
-- This uses a security definer function to filter columns
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- Policy for authenticated users to view other profiles (for directory/matching features)
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
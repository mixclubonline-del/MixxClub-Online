-- SECURITY FIX: Remove email from profiles table to eliminate PII exposure risk
-- Email is already stored in auth.users and can be accessed via auth.uid()
-- This removes the redundant storage of sensitive PII in the public schema

-- Remove email column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Add comment to document the security decision
COMMENT ON TABLE public.profiles IS 
'User profile information for display purposes. Email addresses are NOT stored here 
for security reasons - they are managed by Supabase Auth (auth.users) and can be 
accessed client-side via session.user.email when needed.';

-- Update RLS policies to allow limited profile visibility for collaboration
-- Users can still see their own profile, but now collaborators can see basic info too

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate SELECT policy with better collaboration support
-- Users can see: their own profile, profiles of project collaborators, admin can see all
CREATE POLICY "users_can_view_own_and_collaborator_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  -- Admins can see all profiles
  is_admin(auth.uid())
  OR
  -- Users can see profiles of people they're collaborating with on projects
  EXISTS (
    SELECT 1 FROM projects
    WHERE (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    AND (projects.client_id = profiles.id OR projects.engineer_id = profiles.id)
  )
  OR
  -- Users can see profiles of people in their collaboration sessions
  EXISTS (
    SELECT 1 FROM session_participants sp1
    JOIN session_participants sp2 ON sp1.session_id = sp2.session_id
    WHERE sp1.user_id = auth.uid()
    AND sp2.user_id = profiles.id
    AND sp1.is_active = true
    AND sp2.is_active = true
  )
);

-- Recreate INSERT policy (users can create their own profile)
CREATE POLICY "users_can_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Recreate UPDATE policy (users can update their own profile only)
CREATE POLICY "users_can_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);
-- Phase 1: Critical Security Fixes (Final)
-- Fix 1: Resolve infinite recursion in collaboration policies
-- Fix 2: Implement proper role-based access control using existing user_role enum

-- ============================================
-- Part 1: Create User Roles System
-- ============================================

-- Create user_roles table (using existing user_role enum from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- ============================================
-- Part 2: Fix Infinite Recursion Issues
-- ============================================

-- Drop all policies that depend on user_has_session_access function first
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON public.collaboration_sessions;
DROP POLICY IF EXISTS "Host can update their sessions" ON public.collaboration_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.collaboration_sessions;
DROP POLICY IF EXISTS "Hosts can manage participants" ON public.session_participants;
DROP POLICY IF EXISTS "Users can join sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Participants can view session members" ON public.session_participants;

-- Now safely drop the problematic function
DROP FUNCTION IF EXISTS public.user_has_session_access(uuid, uuid);

-- Create separate security definer functions to break recursion
CREATE OR REPLACE FUNCTION public.is_session_host(session_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaboration_sessions 
    WHERE id = session_uuid 
    AND host_user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_session_participant(session_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM session_participants
    WHERE session_id = session_uuid
    AND user_id = user_uuid
    AND is_active = true
  );
$$;

-- Recreate collaboration_sessions policies with non-recursive logic
CREATE POLICY "Users can create sessions"
ON public.collaboration_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their sessions"
ON public.collaboration_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = host_user_id);

CREATE POLICY "Users can view their sessions"
ON public.collaboration_sessions
FOR SELECT
TO authenticated
USING (
  auth.uid() = host_user_id 
  OR public.is_session_participant(id, auth.uid())
);

-- Recreate session_participants policies with non-recursive logic
CREATE POLICY "Users can join sessions"
ON public.session_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can manage participants"
ON public.session_participants
FOR ALL
TO authenticated
USING (public.is_session_host(session_id, auth.uid()));

CREATE POLICY "Participants can view session members"
ON public.session_participants
FOR SELECT
TO authenticated
USING (
  public.is_session_host(session_id, auth.uid())
  OR (session_id IN (
    SELECT session_id FROM session_participants 
    WHERE user_id = auth.uid() AND is_active = true
  ))
);

-- ============================================
-- Part 3: Update is_admin function
-- ============================================

-- Replace the old is_admin function to use user_roles table
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_uuid, 'admin'::user_role);
$$;

-- ============================================
-- Part 4: Migrate existing users to user_roles table
-- ============================================

-- Insert roles for existing users based on their profile role
INSERT INTO public.user_roles (user_id, role)
SELECT id, role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;
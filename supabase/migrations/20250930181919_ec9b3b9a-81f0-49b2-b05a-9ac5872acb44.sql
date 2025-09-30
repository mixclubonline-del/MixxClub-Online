-- Fix 1: Secure profiles table - restrict email visibility to own profile only
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new restrictive policy - users can only view their own full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a view for public profile data without emails
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  role,
  level,
  points,
  badges,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Fix 2: Resolve session_participants infinite recursion
-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.session_participants;

-- Create a security definer function to check session access
CREATE OR REPLACE FUNCTION public.user_has_session_access(session_uuid uuid, user_uuid uuid)
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
  )
  OR EXISTS (
    SELECT 1 FROM session_participants
    WHERE session_id = session_uuid
    AND user_id = user_uuid
    AND is_active = true
  );
$$;

-- Create new non-recursive policy using the function
CREATE POLICY "Users can view participants in their sessions"
ON public.session_participants
FOR SELECT
USING (public.user_has_session_access(session_id, auth.uid()));

-- Fix 3: Verify contact_submissions security - ensure no read access
DROP POLICY IF EXISTS "Anyone can view contact submissions" ON public.contact_submissions;

-- Only allow admins to view contact submissions (via security definer function)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND role = 'admin'
  );
$$;

CREATE POLICY "Only admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add missing search_path to existing security definer functions
CREATE OR REPLACE FUNCTION public.award_points(user_id uuid, points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_points INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE profiles
  SET points = points + points_to_add
  WHERE id = user_id
  RETURNING points INTO new_points;
  
  new_level := FLOOR(new_points / 1000) + 1;
  
  UPDATE profiles
  SET level = new_level
  WHERE id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_achievement(p_user_id uuid, p_badge_type text, p_badge_name text, p_badge_description text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  achievement_id UUID;
BEGIN
  INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
  VALUES (p_user_id, p_badge_type, p_badge_name, p_badge_description)
  RETURNING id INTO achievement_id;
  
  RETURN achievement_id;
END;
$function$;
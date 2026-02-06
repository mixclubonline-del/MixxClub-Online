
-- Admin RLS policies for the Admin CRM
-- All use the existing has_role() security definer function to avoid recursion

-- 1. user_roles: let admins see all role assignments
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. collaboration_sessions: let admins see every session
CREATE POLICY "Admins can view all sessions"
ON public.collaboration_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. audio_files: let admins see all uploads
CREATE POLICY "Admins can view all audio files"
ON public.audio_files
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. producer_beats: let admins see all beats
CREATE POLICY "Admins can view all beats"
ON public.producer_beats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. engineer_payouts: let admins see all payouts
CREATE POLICY "Admins can view all payouts"
ON public.engineer_payouts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. activity_feed: let admins see all activity
CREATE POLICY "Admins can view all activity"
ON public.activity_feed
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

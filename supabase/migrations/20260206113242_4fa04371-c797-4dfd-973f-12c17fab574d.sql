
-- ===========================================
-- Admin Write RLS Policies (9 total)
-- ===========================================

-- 1. user_roles: Admin INSERT (assign any role to any user)
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. user_roles: Admin DELETE (remove any role from any user)
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. profiles: Admin UPDATE (edit user profiles)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. collaboration_sessions: Admin UPDATE (change session status)
CREATE POLICY "Admins can update any session"
ON public.collaboration_sessions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. collaboration_sessions: Admin DELETE (remove sessions)
CREATE POLICY "Admins can delete any session"
ON public.collaboration_sessions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. audio_files: Admin UPDATE (flag/update metadata)
CREATE POLICY "Admins can update any audio file"
ON public.audio_files
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. audio_files: Admin DELETE (remove violating files)
CREATE POLICY "Admins can delete any audio file"
ON public.audio_files
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. producer_beats: Admin UPDATE (flag/update beat metadata)
CREATE POLICY "Admins can update any beat"
ON public.producer_beats
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. producer_beats: Admin DELETE (remove violating beats)
CREATE POLICY "Admins can delete any beat"
ON public.producer_beats
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. engineer_payouts: Admin UPDATE (process payouts)
CREATE POLICY "Admins can update any payout"
ON public.engineer_payouts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 11. activity_feed: Admin DELETE (remove inappropriate entries)
CREATE POLICY "Admins can delete any activity"
ON public.activity_feed
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

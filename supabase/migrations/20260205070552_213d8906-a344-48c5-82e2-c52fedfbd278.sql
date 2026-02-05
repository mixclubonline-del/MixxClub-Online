-- Allow authenticated users to insert their own role during signup
-- Restricted to 'artist' and 'engineer' roles only (no admin self-assignment)
CREATE POLICY "Users can insert own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('artist'::app_role, 'engineer'::app_role)
);
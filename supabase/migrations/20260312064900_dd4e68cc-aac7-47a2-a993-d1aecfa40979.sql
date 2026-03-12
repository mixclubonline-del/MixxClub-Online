-- Allow authenticated users to insert their own profile row (for onboarding upsert fallback)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
-- Fix contact_submissions table security
-- Ensure RLS is enabled to protect sensitive customer data
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Only admins can view contact submissions" ON public.contact_submissions;

-- Recreate INSERT policy: Allow anyone to submit contact forms (unauthenticated users)
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Recreate SELECT policy: Only admins can view submissions
CREATE POLICY "Only admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Ensure no UPDATE or DELETE policies exist (already blocked by default when RLS is enabled)
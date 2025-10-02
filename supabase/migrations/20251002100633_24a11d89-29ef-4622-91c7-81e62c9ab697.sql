-- Add comprehensive RLS policies for contact_submissions table
-- This ensures that UPDATE and DELETE operations are restricted to admins only

-- Policy for UPDATE: Only admins can update contact submissions
CREATE POLICY "Only admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy for DELETE: Only admins can delete contact submissions
CREATE POLICY "Only admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Add comment explaining the security model
COMMENT ON TABLE public.contact_submissions IS 'Contact form submissions with full RLS protection. INSERT allowed for anyone (public contact form), SELECT/UPDATE/DELETE restricted to admins only to protect customer PII (names, emails, phone numbers, messages).';
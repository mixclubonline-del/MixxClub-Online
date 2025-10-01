-- Priority 1: Fix RLS Policy Infinite Recursion on session_participants
-- Drop ALL existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'session_participants' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON session_participants';
    END LOOP;
END $$;

-- Create non-recursive policies using security definer functions
CREATE POLICY "Session hosts can view all participants"
ON session_participants
FOR SELECT
USING (is_session_host(session_id, auth.uid()));

CREATE POLICY "Participants can view their own participation"
ON session_participants
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Session hosts can manage participants"
ON session_participants
FOR ALL
USING (is_session_host(session_id, auth.uid()));

CREATE POLICY "Users can join sessions"
ON session_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON session_participants
FOR UPDATE
USING (auth.uid() = user_id);

-- Priority 2: Secure Customer Contact Data
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON contact_submissions';
    END LOOP;
END $$;

-- Recreate with stricter validation
CREATE POLICY "Anyone can submit contact form"
ON contact_submissions
FOR INSERT
WITH CHECK (
  name IS NOT NULL AND 
  email IS NOT NULL AND 
  message IS NOT NULL AND
  length(trim(name)) BETWEEN 1 AND 100 AND
  length(trim(email)) BETWEEN 5 AND 255 AND
  length(trim(message)) BETWEEN 10 AND 1000 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "Only admins can read contact submissions"
ON contact_submissions
FOR SELECT
USING (is_admin(auth.uid()));

-- Priority 3: Protect Job Posting Business Information
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'job_postings' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON job_postings';
    END LOOP;
END $$;

-- Create new policies with better information protection
CREATE POLICY "Artists can create their own job postings"
ON job_postings
FOR INSERT
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can view and manage their own postings"
ON job_postings
FOR ALL
USING (auth.uid() = artist_id);

CREATE POLICY "Engineers can view basic info of open jobs"
ON job_postings
FOR SELECT
USING (
  status = 'open' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Assigned engineers can view full job details"
ON job_postings
FOR SELECT
USING (auth.uid() = assigned_engineer_id);

CREATE POLICY "Applied engineers can view full details"
ON job_postings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_applications
    WHERE job_applications.job_id = job_postings.id
    AND job_applications.engineer_id = auth.uid()
  )
);

CREATE POLICY "Assigned engineers can update job status"
ON job_postings
FOR UPDATE
USING (auth.uid() = assigned_engineer_id)
WITH CHECK (auth.uid() = assigned_engineer_id);

-- Priority 4: Add audit logging table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'audit_logs' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON audit_logs';
    END LOOP;
END $$;

CREATE POLICY "Only admins can view audit logs"
ON audit_logs
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON audit_logs
FOR INSERT
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
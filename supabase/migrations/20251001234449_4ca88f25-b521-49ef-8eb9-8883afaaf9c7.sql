-- Fix infinite recursion in job_postings RLS policies
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Applied engineers can view full details" ON job_postings;
DROP POLICY IF EXISTS "Artists can create their own job postings" ON job_postings;
DROP POLICY IF EXISTS "Artists can view and manage their own postings" ON job_postings;
DROP POLICY IF EXISTS "Assigned engineers can update job status" ON job_postings;
DROP POLICY IF EXISTS "Assigned engineers can view full job details" ON job_postings;
DROP POLICY IF EXISTS "Engineers can view basic info of open jobs" ON job_postings;

-- Create simplified policies without recursion
CREATE POLICY "Artists can manage their postings"
ON job_postings
FOR ALL
TO authenticated
USING (auth.uid() = artist_id)
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Assigned engineers can view and update"
ON job_postings
FOR ALL
TO authenticated
USING (auth.uid() = assigned_engineer_id)
WITH CHECK (auth.uid() = assigned_engineer_id);

CREATE POLICY "Engineers can view open jobs"
ON job_postings
FOR SELECT
TO authenticated
USING (
  status = 'open' 
  AND auth.uid() IS NOT NULL
);
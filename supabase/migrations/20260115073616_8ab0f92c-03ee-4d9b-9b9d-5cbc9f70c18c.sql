-- Fix overly permissive RLS policies on payments table
-- These policies need to restrict to service_role only, which bypasses RLS anyway
-- So we can remove them and rely on service_role bypassing RLS

DROP POLICY IF EXISTS "System can insert payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;

-- Instead, create a proper policy that allows the user to view their own payments
-- and relies on service_role (which bypasses RLS) for inserts/updates from webhooks
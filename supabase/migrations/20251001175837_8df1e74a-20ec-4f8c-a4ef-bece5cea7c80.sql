-- Phase 5: Implement Audit Trail Triggers
-- Create reusable audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Add audit triggers for sensitive tables
DROP TRIGGER IF EXISTS audit_contact_submissions ON contact_submissions;
CREATE TRIGGER audit_contact_submissions
  AFTER INSERT OR UPDATE OR DELETE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_user_roles ON user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_engineer_earnings ON engineer_earnings;
CREATE TRIGGER audit_engineer_earnings
  AFTER INSERT OR UPDATE OR DELETE ON engineer_earnings
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_payout_requests ON payout_requests;
CREATE TRIGGER audit_payout_requests
  AFTER INSERT OR UPDATE OR DELETE ON payout_requests
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_job_applications ON job_applications;
CREATE TRIGGER audit_job_applications
  AFTER INSERT OR UPDATE OR DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_mastering_subscriptions ON user_mastering_subscriptions;
CREATE TRIGGER audit_mastering_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON user_mastering_subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_mixing_subscriptions ON user_mixing_subscriptions;
CREATE TRIGGER audit_mixing_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON user_mixing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Phase 6: Add rate limiting table for contact form
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can manage rate limits" ON rate_limits;
CREATE POLICY "System can manage rate limits"
ON rate_limits
FOR ALL
USING (true);
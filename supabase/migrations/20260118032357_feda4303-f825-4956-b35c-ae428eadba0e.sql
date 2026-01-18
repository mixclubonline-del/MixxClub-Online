-- Add maturity tracking to engineer_payouts for fraud protection (3-day holding period)
ALTER TABLE engineer_payouts ADD COLUMN IF NOT EXISTS 
  eligible_for_payout_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 days');

-- Update existing pending payouts to be immediately eligible (for existing records)
UPDATE engineer_payouts 
SET eligible_for_payout_at = created_at + INTERVAL '3 days'
WHERE eligible_for_payout_at IS NULL;

-- Index for efficient scheduled processing queries
CREATE INDEX IF NOT EXISTS idx_engineer_payouts_eligible 
  ON engineer_payouts(eligible_for_payout_at) 
  WHERE status = 'pending';

-- Create payout processing logs table for audit trail
CREATE TABLE IF NOT EXISTS payout_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  trigger_source TEXT NOT NULL, -- 'n8n_schedule', 'admin_manual', 'api_call'
  payouts_processed INTEGER DEFAULT 0,
  payouts_failed INTEGER DEFAULT 0,
  payouts_skipped INTEGER DEFAULT 0,
  total_amount_transferred NUMERIC DEFAULT 0,
  error_details JSONB,
  processing_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on processing logs
ALTER TABLE payout_processing_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all processing logs
CREATE POLICY "Admins can view processing logs" ON payout_processing_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admins can insert processing logs
CREATE POLICY "Admins can insert processing logs" ON payout_processing_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Service role can manage processing logs (for edge functions)
CREATE POLICY "Service role manages processing logs" ON payout_processing_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Function to notify admins when payouts mature
CREATE OR REPLACE FUNCTION notify_payout_ready()
RETURNS TRIGGER AS $$
BEGIN
  -- When a payout becomes eligible and is still pending, notify admins
  IF NEW.status = 'pending' 
     AND NEW.eligible_for_payout_at IS NOT NULL
     AND NEW.eligible_for_payout_at <= NOW() 
     AND (OLD.eligible_for_payout_at IS NULL OR OLD.eligible_for_payout_at > NOW()) THEN
    
    INSERT INTO notifications (user_id, title, message, type, metadata)
    SELECT ur.user_id, 
           'Payout Ready for Processing', 
           format('Engineer payout of $%s is ready for processing', NEW.net_amount::TEXT),
           'admin_action', 
           jsonb_build_object(
             'payout_id', NEW.id, 
             'amount', NEW.net_amount,
             'engineer_id', NEW.engineer_id
           )
    FROM user_roles ur 
    WHERE ur.role = 'admin' 
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify when payouts become eligible
DROP TRIGGER IF EXISTS trigger_notify_payout_ready ON engineer_payouts;
CREATE TRIGGER trigger_notify_payout_ready
  AFTER UPDATE ON engineer_payouts
  FOR EACH ROW
  EXECUTE FUNCTION notify_payout_ready();
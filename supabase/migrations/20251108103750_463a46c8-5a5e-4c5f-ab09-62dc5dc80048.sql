-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create table to track contract expiration notifications
CREATE TABLE IF NOT EXISTS public.contract_expiration_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.enterprise_contracts(id) ON DELETE CASCADE,
  days_threshold INTEGER NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'email',
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contract_id, days_threshold)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contract_expiration_notifications_contract 
  ON public.contract_expiration_notifications(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_expiration_notifications_sent 
  ON public.contract_expiration_notifications(sent_at);

-- Enable RLS
ALTER TABLE public.contract_expiration_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow admins to view expiration notifications"
  ON public.contract_expiration_notifications
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert expiration notifications"
  ON public.contract_expiration_notifications
  FOR INSERT
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.contract_expiration_notifications TO service_role;

COMMENT ON TABLE public.contract_expiration_notifications IS 'Tracks sent contract expiration notifications to prevent duplicates';
COMMENT ON COLUMN public.contract_expiration_notifications.days_threshold IS 'Number of days before expiration when notification was sent (e.g., 30, 7, 1)';

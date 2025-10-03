-- Create deployment logs table
CREATE TABLE deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_type TEXT NOT NULL CHECK (deployment_type IN ('pwa', 'android', 'ios', 'feature_unlock', 'maintenance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'rolled_back')),
  initiated_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  deployment_config JSONB DEFAULT '{}'::jsonb,
  pre_flight_checks JSONB DEFAULT '{}'::jsonb,
  rollback_id UUID REFERENCES deployment_logs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all deployment logs
CREATE POLICY "Admins can view deployment logs"
ON deployment_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can insert deployment logs
CREATE POLICY "Admins can insert deployment logs"
ON deployment_logs
FOR INSERT
WITH CHECK (is_admin(auth.uid()) AND auth.uid() = initiated_by);

-- Admins can update deployment logs
CREATE POLICY "Admins can update deployment logs"
ON deployment_logs
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_deployment_logs_status ON deployment_logs(status);
CREATE INDEX idx_deployment_logs_type ON deployment_logs(deployment_type);
CREATE INDEX idx_deployment_logs_created ON deployment_logs(created_at DESC);
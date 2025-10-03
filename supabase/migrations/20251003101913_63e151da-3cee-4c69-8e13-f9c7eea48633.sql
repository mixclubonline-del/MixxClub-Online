-- Create launch metrics tracking table
CREATE TABLE IF NOT EXISTS public.launch_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL UNIQUE,
  qualifier_started INT DEFAULT 0,
  qualifier_completed INT DEFAULT 0,
  signups INT DEFAULT 0,
  projects_created INT DEFAULT 0,
  payments_completed INT DEFAULT 0,
  revenue_daily NUMERIC DEFAULT 0,
  ad_spend_daily NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.launch_metrics ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage launch metrics
CREATE POLICY "Admins can view launch metrics"
  ON public.launch_metrics
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert launch metrics"
  ON public.launch_metrics
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update launch metrics"
  ON public.launch_metrics
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- System can insert/update metrics
CREATE POLICY "System can manage launch metrics"
  ON public.launch_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_launch_metrics_date ON public.launch_metrics(metric_date DESC);
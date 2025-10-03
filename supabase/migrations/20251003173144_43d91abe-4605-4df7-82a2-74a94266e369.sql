-- ============================================
-- SECURE AI ADMIN CHATBOT - DATABASE SCHEMA
-- ============================================

-- Part 1: Chatbot Audit Logs Table
-- Comprehensive logging of all chatbot interactions for forensic analysis
CREATE TABLE IF NOT EXISTS public.chatbot_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid NOT NULL,
  user_input text NOT NULL,
  ai_response text NOT NULL,
  security_check_passed boolean NOT NULL DEFAULT true,
  injection_attempts_detected integer NOT NULL DEFAULT 0,
  dangerous_patterns_found text[] DEFAULT '{}',
  tools_called text[] DEFAULT '{}',
  data_accessed text[] DEFAULT '{}',
  ip_address text,
  user_agent text,
  device_info jsonb DEFAULT '{}',
  response_time_ms integer,
  ai_model_used text,
  token_count integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on chatbot_audit_logs
ALTER TABLE public.chatbot_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view their own audit logs
CREATE POLICY "Admins can view their own audit logs"
ON public.chatbot_audit_logs
FOR SELECT
TO authenticated
USING (auth.uid() = admin_id AND is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.chatbot_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_chatbot_audit_logs_admin_id ON public.chatbot_audit_logs(admin_id);
CREATE INDEX idx_chatbot_audit_logs_created_at ON public.chatbot_audit_logs(created_at DESC);
CREATE INDEX idx_chatbot_audit_logs_security ON public.chatbot_audit_logs(security_check_passed, injection_attempts_detected);

-- Part 2: Admin Security Events Table
-- Track security-related events and anomalies
CREATE TABLE IF NOT EXISTS public.admin_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'rate_limit', 'injection_attempt', 'unauthorized_access', 'suspicious_activity'
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_notes text,
  auto_action_taken text, -- 'account_locked', 'session_terminated', 'alert_sent', 'none'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on admin_security_events
ALTER TABLE public.admin_security_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all security events
CREATE POLICY "Admins can view security events"
ON public.admin_security_events
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert security events
CREATE POLICY "System can insert security events"
ON public.admin_security_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can update security events (mark as resolved)
CREATE POLICY "Admins can update security events"
ON public.admin_security_events
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_admin_security_events_type ON public.admin_security_events(event_type);
CREATE INDEX idx_admin_security_events_severity ON public.admin_security_events(severity);
CREATE INDEX idx_admin_security_events_resolved ON public.admin_security_events(is_resolved);
CREATE INDEX idx_admin_security_events_created_at ON public.admin_security_events(created_at DESC);

-- Part 3: Admin Quick Actions Table
-- Track pre-approved quick actions for audit trail
CREATE TABLE IF NOT EXISTS public.admin_quick_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL, -- 'generate_report', 'export_data', 'check_health', etc.
  action_name text NOT NULL,
  parameters jsonb DEFAULT '{}',
  result jsonb DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message text,
  execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on admin_quick_actions
ALTER TABLE public.admin_quick_actions ENABLE ROW LEVEL SECURITY;

-- Admins can view their own quick actions
CREATE POLICY "Admins can view their own quick actions"
ON public.admin_quick_actions
FOR SELECT
TO authenticated
USING (auth.uid() = admin_id AND is_admin(auth.uid()));

-- Admins can insert their own quick actions
CREATE POLICY "Admins can insert quick actions"
ON public.admin_quick_actions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id AND is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_admin_quick_actions_admin_id ON public.admin_quick_actions(admin_id);
CREATE INDEX idx_admin_quick_actions_type ON public.admin_quick_actions(action_type);
CREATE INDEX idx_admin_quick_actions_created_at ON public.admin_quick_actions(created_at DESC);

-- Part 4: Security Helper Functions

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text,
  p_admin_id uuid,
  p_description text,
  p_details jsonb DEFAULT '{}',
  p_auto_action text DEFAULT 'none'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO admin_security_events (
    event_type,
    severity,
    admin_id,
    description,
    details,
    auto_action_taken
  ) VALUES (
    p_event_type,
    p_severity,
    p_admin_id,
    p_description,
    p_details,
    p_auto_action
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Function to check admin chatbot rate limits
CREATE OR REPLACE FUNCTION public.check_admin_chatbot_rate_limit(
  p_admin_id uuid,
  p_limit_per_minute integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_count integer;
BEGIN
  -- Count messages in last minute
  SELECT COUNT(*)
  INTO message_count
  FROM chatbot_audit_logs
  WHERE admin_id = p_admin_id
    AND created_at >= now() - interval '1 minute';
  
  -- Log if rate limit exceeded
  IF message_count >= p_limit_per_minute THEN
    PERFORM log_security_event(
      'rate_limit',
      'medium',
      p_admin_id,
      'Admin chatbot rate limit exceeded',
      jsonb_build_object('message_count', message_count, 'limit', p_limit_per_minute),
      'alert_sent'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to get security dashboard stats
CREATE OR REPLACE FUNCTION public.get_security_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats jsonb;
BEGIN
  -- Verify admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  SELECT jsonb_build_object(
    'total_events_today', (
      SELECT COUNT(*) FROM admin_security_events
      WHERE created_at >= CURRENT_DATE
    ),
    'critical_unresolved', (
      SELECT COUNT(*) FROM admin_security_events
      WHERE severity = 'critical' AND is_resolved = false
    ),
    'high_unresolved', (
      SELECT COUNT(*) FROM admin_security_events
      WHERE severity = 'high' AND is_resolved = false
    ),
    'injection_attempts_today', (
      SELECT COALESCE(SUM(injection_attempts_detected), 0) FROM chatbot_audit_logs
      WHERE created_at >= CURRENT_DATE
    ),
    'failed_security_checks_today', (
      SELECT COUNT(*) FROM chatbot_audit_logs
      WHERE created_at >= CURRENT_DATE AND security_check_passed = false
    ),
    'total_audit_logs', (
      SELECT COUNT(*) FROM chatbot_audit_logs
    ),
    'quick_actions_today', (
      SELECT COUNT(*) FROM admin_quick_actions
      WHERE created_at >= CURRENT_DATE
    )
  )
  INTO stats;
  
  RETURN stats;
END;
$$;
-- Update is_admin() function to only allow mixclubonline@gmail.com
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = user_uuid
      AND u.email = 'mixclubonline@gmail.com'
  );
$$;

-- Remove all admin roles from user_roles table
DELETE FROM public.user_roles WHERE role = 'admin';

-- Create legal_documents table
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('terms', 'privacy', 'security')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  effective_date TIMESTAMPTZ,
  
  -- DocuSign Integration
  docusign_envelope_id TEXT,
  docusign_status TEXT CHECK (docusign_status IN ('draft', 'sent', 'completed', 'declined', 'voided')),
  docusign_sent_at TIMESTAMPTZ,
  docusign_completed_at TIMESTAMPTZ,
  docusign_document_url TEXT,
  
  -- Attorney Review
  attorney_reviewed BOOLEAN DEFAULT false,
  attorney_email TEXT,
  attorney_name TEXT,
  attorney_notes TEXT,
  attorney_reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(document_type, version)
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can manage legal documents"
ON public.legal_documents
FOR ALL
USING (is_admin(auth.uid()));

-- Create presentation_shares table
CREATE TABLE IF NOT EXISTS public.presentation_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  presentation_type TEXT NOT NULL DEFAULT 'system',
  
  -- Access control
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  access_count INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  recipient_email TEXT,
  recipient_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CHECK (expires_at > created_at)
);

ALTER TABLE public.presentation_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can manage presentation shares"
ON public.presentation_shares
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone with token can view share details"
ON public.presentation_shares
FOR SELECT
USING (is_active AND expires_at > now());

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view system metrics"
ON public.system_metrics
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert metrics"
ON public.system_metrics
FOR INSERT
WITH CHECK (true);

-- Create attorney_notifications table
CREATE TABLE IF NOT EXISTS public.attorney_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.legal_documents(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('review_requested', 'review_completed', 'revision_needed')),
  
  -- Attorney info
  attorney_email TEXT NOT NULL,
  attorney_name TEXT,
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,
  
  -- Response tracking
  responded BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.attorney_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can manage attorney notifications"
ON public.attorney_notifications
FOR ALL
USING (is_admin(auth.uid()));

-- Create share_link_security_logs table
CREATE TABLE IF NOT EXISTS public.share_link_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES public.presentation_shares(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_share_id ON public.share_link_security_logs(share_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON public.share_link_security_logs(ip_address);

ALTER TABLE public.share_link_security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view security logs"
ON public.share_link_security_logs
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert security logs"
ON public.share_link_security_logs
FOR INSERT
WITH CHECK (true);
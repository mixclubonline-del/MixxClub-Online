-- Create unified chatbot message history table
CREATE TABLE IF NOT EXISTS public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chatbot_type TEXT NOT NULL, -- 'admin', 'artist', 'engineer', 'mastering', 'persistent'
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for efficient queries
CREATE INDEX idx_chatbot_messages_user_id ON public.chatbot_messages(user_id);
CREATE INDEX idx_chatbot_messages_session_id ON public.chatbot_messages(session_id);
CREATE INDEX idx_chatbot_messages_chatbot_type ON public.chatbot_messages(chatbot_type);
CREATE INDEX idx_chatbot_messages_created_at ON public.chatbot_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own chatbot messages"
ON public.chatbot_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own chatbot messages"
ON public.chatbot_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all chatbot messages"
ON public.chatbot_messages
FOR SELECT
USING (is_admin(auth.uid()));

-- Create table for admin alerts
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for admin alerts
CREATE INDEX idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX idx_admin_alerts_is_resolved ON public.admin_alerts(is_resolved);
CREATE INDEX idx_admin_alerts_created_at ON public.admin_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view alerts
CREATE POLICY "Admins can view all alerts"
ON public.admin_alerts
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can manage alerts
CREATE POLICY "Admins can manage alerts"
ON public.admin_alerts
FOR ALL
USING (is_admin(auth.uid()));

-- Create function to create admin alerts
CREATE OR REPLACE FUNCTION public.create_admin_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO admin_alerts (alert_type, severity, title, message, metadata)
  VALUES (p_alert_type, p_severity, p_title, p_message, p_metadata)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION public.update_chatbot_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_chatbot_messages_timestamp
BEFORE UPDATE ON public.chatbot_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chatbot_messages_updated_at();

CREATE TRIGGER update_admin_alerts_timestamp
BEFORE UPDATE ON public.admin_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_chatbot_messages_updated_at();
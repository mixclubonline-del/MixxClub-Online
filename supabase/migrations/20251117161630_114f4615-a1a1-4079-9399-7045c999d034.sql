-- Add missing fields to job_postings
ALTER TABLE public.job_postings
  ADD COLUMN genre TEXT,
  ADD COLUMN budget DECIMAL(10, 2),
  ADD COLUMN service_type TEXT,
  ADD COLUMN ai_analysis JSONB,
  ADD COLUMN stems_prepared BOOLEAN DEFAULT false;

-- Add missing fields to mastering_packages
ALTER TABLE public.mastering_packages
  ADD COLUMN currency TEXT DEFAULT 'USD',
  ADD COLUMN track_limit INTEGER;

-- Add missing fields to ai_financial_insights
ALTER TABLE public.ai_financial_insights
  ADD COLUMN severity TEXT,
  ADD COLUMN impact_amount DECIMAL(10, 2),
  ADD COLUMN action_taken BOOLEAN DEFAULT false;

-- Add missing fields to audit_logs
ALTER TABLE public.audit_logs
  ADD COLUMN table_name TEXT,
  ADD COLUMN record_id UUID,
  ADD COLUMN old_data JSONB,
  ADD COLUMN new_data JSONB;

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  genre TEXT,
  bpm INTEGER,
  key TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create ai_collaboration_matches table
CREATE TABLE public.ai_collaboration_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  matched_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_score DECIMAL(3, 2),
  match_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_collaboration_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matches for their projects"
  ON public.ai_collaboration_matches FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()) OR
    matched_user_id = auth.uid()
  );

CREATE POLICY "System can create matches"
  ON public.ai_collaboration_matches FOR INSERT
  WITH CHECK (true);

-- Create revenue_analytics table
CREATE TABLE public.revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  mrr DECIMAL(12, 2),
  arr DECIMAL(12, 2),
  average_revenue_per_user DECIMAL(10, 2),
  churn_rate DECIMAL(5, 4),
  new_customers INTEGER,
  total_revenue DECIMAL(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage revenue analytics"
  ON public.revenue_analytics FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create user_mixing_subscriptions table
CREATE TABLE public.user_mixing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_mixing_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mixing subscriptions"
  ON public.user_mixing_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_mixing_subscriptions_updated_at
  BEFORE UPDATE ON public.user_mixing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_distribution_subscriptions table
CREATE TABLE public.user_distribution_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_distribution_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own distribution subscriptions"
  ON public.user_distribution_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_distribution_subscriptions_updated_at
  BEFORE UPDATE ON public.user_distribution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create chatbot_messages table
CREATE TABLE public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chatbot messages"
  ON public.chatbot_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chatbot messages"
  ON public.chatbot_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create database functions for cleanup
CREATE OR REPLACE FUNCTION public.cleanup_old_chatbot_messages()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.chatbot_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '180 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create indexes for new tables
CREATE INDEX idx_projects_user ON public.projects(user_id);
CREATE INDEX idx_ai_collaboration_matches_project ON public.ai_collaboration_matches(project_id);
CREATE INDEX idx_ai_collaboration_matches_user ON public.ai_collaboration_matches(matched_user_id);
CREATE INDEX idx_chatbot_messages_user ON public.chatbot_messages(user_id);
CREATE INDEX idx_chatbot_messages_created ON public.chatbot_messages(created_at);
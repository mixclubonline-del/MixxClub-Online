-- Add missing fields to revenue_analytics
ALTER TABLE public.revenue_analytics
  ADD COLUMN churned_customers INTEGER DEFAULT 0,
  ADD COLUMN new_mrr DECIMAL(12, 2),
  ADD COLUMN churn_mrr DECIMAL(12, 2);

-- Add missing fields to ai_collaboration_matches
ALTER TABLE public.ai_collaboration_matches
  ADD COLUMN artist_id UUID REFERENCES auth.users(id),
  ADD COLUMN engineer_id UUID REFERENCES auth.users(id),
  ADD COLUMN compatibility_score DECIMAL(3, 2),
  ADD COLUMN genre_match_score DECIMAL(3, 2),
  ADD COLUMN technical_match_score DECIMAL(3, 2),
  ADD COLUMN style_match_score DECIMAL(3, 2);

-- Create engineer_profiles table
CREATE TABLE public.engineer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialties TEXT[],
  hourly_rate DECIMAL(10, 2),
  years_experience INTEGER,
  genres TEXT[],
  equipment_list TEXT[],
  portfolio_url TEXT,
  availability_status TEXT DEFAULT 'available',
  rating DECIMAL(3, 2),
  completed_projects INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.engineer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view engineer profiles"
  ON public.engineer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Engineers can update their own profile"
  ON public.engineer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Engineers can create their profile"
  ON public.engineer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_engineer_profiles_updated_at
  BEFORE UPDATE ON public.engineer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create engineer_earnings table
CREATE TABLE public.engineer_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing')),
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.engineer_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers can view their own earnings"
  ON public.engineer_earnings FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Admins can view all earnings"
  ON public.engineer_earnings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create admin_quick_actions table
CREATE TABLE public.admin_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_quick_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view quick actions"
  ON public.admin_quick_actions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can log quick actions"
  ON public.admin_quick_actions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create admin_security_events table
CREATE TABLE public.admin_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security events"
  ON public.admin_security_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create notification function
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT DEFAULT 'info',
  _action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES (_user_id, _title, _message, _type, _action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Add indexes
CREATE INDEX idx_engineer_profiles_user ON public.engineer_profiles(user_id);
CREATE INDEX idx_engineer_earnings_engineer ON public.engineer_earnings(engineer_id);
CREATE INDEX idx_admin_security_events_severity ON public.admin_security_events(severity);
CREATE INDEX idx_admin_security_events_resolved ON public.admin_security_events(is_resolved);
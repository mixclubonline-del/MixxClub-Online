-- ============================================
-- Phase 2: Collaborative Earnings Dashboard
-- Partnership Tables Migration
-- ============================================

-- 1. Partnerships Table (Artist-Engineer Agreements)
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  engineer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'disputed')),
  default_split_type TEXT NOT NULL DEFAULT 'percentage' CHECK (default_split_type IN ('percentage', 'fixed', 'milestone', 'royalty')),
  artist_percentage NUMERIC DEFAULT 50,
  engineer_percentage NUMERIC DEFAULT 50,
  total_revenue NUMERIC DEFAULT 0,
  artist_earnings NUMERIC DEFAULT 0,
  engineer_earnings NUMERIC DEFAULT 0,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT unique_partnership UNIQUE (artist_id, engineer_id)
);

-- 2. Collaborative Projects Table
CREATE TABLE IF NOT EXISTS public.collaborative_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT DEFAULT 'single' CHECK (project_type IN ('single', 'ep', 'album', 'remix', 'production')),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'mixing', 'mastering', 'completed', 'released')),
  total_revenue NUMERIC DEFAULT 0,
  release_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Revenue Splits Table
CREATE TABLE IF NOT EXISTS public.revenue_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE SET NULL,
  split_type TEXT NOT NULL DEFAULT 'percentage' CHECK (split_type IN ('percentage', 'fixed', 'milestone', 'royalty')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  artist_amount NUMERIC NOT NULL DEFAULT 0,
  engineer_amount NUMERIC NOT NULL DEFAULT 0,
  artist_percentage NUMERIC,
  engineer_percentage NUMERIC,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Payment Links Table
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  link_url TEXT NOT NULL,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Project Milestones Table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  payment_amount NUMERIC,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deliverables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Message Revenue Links Table
CREATE TABLE IF NOT EXISTS public.message_revenue_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  revenue_split_id UUID NOT NULL REFERENCES public.revenue_splits(id) ON DELETE CASCADE,
  link_type TEXT DEFAULT 'notification' CHECK (link_type IN ('notification', 'request', 'confirmation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Partnership Metrics Table
CREATE TABLE IF NOT EXISTS public.partnership_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  total_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  average_project_value NUMERIC DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_partnership_metrics UNIQUE (partnership_id)
);

-- 8. Partnership Health Table
CREATE TABLE IF NOT EXISTS public.partnership_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  activity_score INTEGER DEFAULT 100,
  payment_score INTEGER DEFAULT 100,
  communication_score INTEGER DEFAULT 100,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  factors JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_partnership_health UNIQUE (partnership_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_partnerships_artist ON public.partnerships(artist_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_engineer ON public.partnerships(engineer_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_pair ON public.partnerships(artist_id, engineer_id);

CREATE INDEX IF NOT EXISTS idx_collab_projects_partnership ON public.collaborative_projects(partnership_id);
CREATE INDEX IF NOT EXISTS idx_collab_projects_status ON public.collaborative_projects(status);

CREATE INDEX IF NOT EXISTS idx_revenue_splits_partnership ON public.revenue_splits(partnership_id);
CREATE INDEX IF NOT EXISTS idx_revenue_splits_project ON public.revenue_splits(project_id);
CREATE INDEX IF NOT EXISTS idx_revenue_splits_status ON public.revenue_splits(status);

CREATE INDEX IF NOT EXISTS idx_payment_links_partnership ON public.payment_links(partnership_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON public.payment_links(status);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.project_milestones(status);

CREATE INDEX IF NOT EXISTS idx_msg_revenue_links_revenue ON public.message_revenue_links(revenue_split_id);

-- ============================================
-- Row Level Security Policies
-- ============================================

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_revenue_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_health ENABLE ROW LEVEL SECURITY;

-- Partnerships: Users can see partnerships they're part of
CREATE POLICY "Users can view own partnerships" ON public.partnerships
  FOR SELECT USING (auth.uid() = artist_id OR auth.uid() = engineer_id);

CREATE POLICY "Users can create partnerships" ON public.partnerships
  FOR INSERT WITH CHECK (auth.uid() = artist_id OR auth.uid() = engineer_id);

CREATE POLICY "Users can update own partnerships" ON public.partnerships
  FOR UPDATE USING (auth.uid() = artist_id OR auth.uid() = engineer_id);

-- Collaborative Projects: Accessible to partnership members
CREATE POLICY "Partnership members can view projects" ON public.collaborative_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can create projects" ON public.collaborative_projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can update projects" ON public.collaborative_projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Revenue Splits: Accessible to partnership members
CREATE POLICY "Partnership members can view revenue splits" ON public.revenue_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can create revenue splits" ON public.revenue_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Payment Links: Accessible to partnership members
CREATE POLICY "Partnership members can view payment links" ON public.payment_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can create payment links" ON public.payment_links
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Project Milestones: Accessible via project's partnership
CREATE POLICY "Partnership members can view milestones" ON public.project_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collaborative_projects cp
      JOIN public.partnerships p ON p.id = cp.partnership_id
      WHERE cp.id = project_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can manage milestones" ON public.project_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collaborative_projects cp
      JOIN public.partnerships p ON p.id = cp.partnership_id
      WHERE cp.id = project_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Message Revenue Links: Accessible to partnership members
CREATE POLICY "Partnership members can view message links" ON public.message_revenue_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.revenue_splits rs
      JOIN public.partnerships p ON p.id = rs.partnership_id
      WHERE rs.id = revenue_split_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Partnership Metrics: Read-only for partnership members
CREATE POLICY "Partnership members can view metrics" ON public.partnership_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Partnership Health: Read-only for partnership members
CREATE POLICY "Partnership members can view health" ON public.partnership_health
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- ============================================
-- Helper Functions
-- ============================================

-- Function to calculate partnership metrics
CREATE OR REPLACE FUNCTION public.calculate_partnership_metrics(p_partnership_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_projects INTEGER;
  v_completed_projects INTEGER;
  v_total_revenue NUMERIC;
  v_avg_value NUMERIC;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed' OR status = 'released'),
    COALESCE(SUM(total_revenue), 0)
  INTO v_total_projects, v_completed_projects, v_total_revenue
  FROM public.collaborative_projects
  WHERE partnership_id = p_partnership_id;

  v_avg_value := CASE WHEN v_total_projects > 0 THEN v_total_revenue / v_total_projects ELSE 0 END;

  INSERT INTO public.partnership_metrics (
    partnership_id, total_projects, completed_projects, 
    total_revenue, average_project_value, last_activity_at, calculated_at
  )
  VALUES (
    p_partnership_id, v_total_projects, v_completed_projects,
    v_total_revenue, v_avg_value, now(), now()
  )
  ON CONFLICT (partnership_id) DO UPDATE SET
    total_projects = EXCLUDED.total_projects,
    completed_projects = EXCLUDED.completed_projects,
    total_revenue = EXCLUDED.total_revenue,
    average_project_value = EXCLUDED.average_project_value,
    last_activity_at = EXCLUDED.last_activity_at,
    calculated_at = EXCLUDED.calculated_at;
END;
$$;

-- Function to calculate partnership health score
CREATE OR REPLACE FUNCTION public.calculate_partnership_health(p_partnership_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_score INTEGER := 100;
  v_payment_score INTEGER := 100;
  v_communication_score INTEGER := 100;
  v_health_score INTEGER;
  v_last_activity TIMESTAMPTZ;
  v_pending_payments INTEGER;
BEGIN
  -- Activity score based on last project activity
  SELECT MAX(updated_at) INTO v_last_activity
  FROM public.collaborative_projects
  WHERE partnership_id = p_partnership_id;

  IF v_last_activity IS NOT NULL THEN
    IF v_last_activity < now() - INTERVAL '90 days' THEN
      v_activity_score := 50;
    ELSIF v_last_activity < now() - INTERVAL '30 days' THEN
      v_activity_score := 75;
    END IF;
  END IF;

  -- Payment score based on pending payments
  SELECT COUNT(*) INTO v_pending_payments
  FROM public.revenue_splits
  WHERE partnership_id = p_partnership_id AND status = 'pending';

  IF v_pending_payments > 5 THEN
    v_payment_score := 50;
  ELSIF v_pending_payments > 2 THEN
    v_payment_score := 75;
  END IF;

  -- Calculate overall health score
  v_health_score := (v_activity_score + v_payment_score + v_communication_score) / 3;

  -- Update health record
  INSERT INTO public.partnership_health (
    partnership_id, health_score, activity_score, 
    payment_score, communication_score, last_calculated_at, factors
  )
  VALUES (
    p_partnership_id, v_health_score, v_activity_score,
    v_payment_score, v_communication_score, now(),
    jsonb_build_object(
      'last_activity', v_last_activity,
      'pending_payments', v_pending_payments
    )
  )
  ON CONFLICT (partnership_id) DO UPDATE SET
    health_score = EXCLUDED.health_score,
    activity_score = EXCLUDED.activity_score,
    payment_score = EXCLUDED.payment_score,
    communication_score = EXCLUDED.communication_score,
    last_calculated_at = EXCLUDED.last_calculated_at,
    factors = EXCLUDED.factors;

  RETURN v_health_score;
END;
$$;

-- Trigger to auto-update partnership revenue totals
CREATE OR REPLACE FUNCTION public.update_partnership_revenue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.partnerships
  SET 
    total_revenue = (
      SELECT COALESCE(SUM(total_amount), 0) 
      FROM public.revenue_splits 
      WHERE partnership_id = NEW.partnership_id AND status = 'completed'
    ),
    artist_earnings = (
      SELECT COALESCE(SUM(artist_amount), 0) 
      FROM public.revenue_splits 
      WHERE partnership_id = NEW.partnership_id AND status = 'completed'
    ),
    engineer_earnings = (
      SELECT COALESCE(SUM(engineer_amount), 0) 
      FROM public.revenue_splits 
      WHERE partnership_id = NEW.partnership_id AND status = 'completed'
    ),
    updated_at = now()
  WHERE id = NEW.partnership_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_partnership_revenue
  AFTER INSERT OR UPDATE ON public.revenue_splits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_partnership_revenue();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.partnerships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_splits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partnership_health;
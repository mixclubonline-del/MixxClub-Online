-- =====================================================
-- DIRECT MESSAGING SYSTEM
-- =====================================================

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  CONSTRAINT different_users CHECK (sender_id != recipient_id)
);

-- Create indexes for direct_messages
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(sender_id, recipient_id, created_at DESC);

-- RLS for direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- =====================================================
-- PARTNERSHIP SYSTEM
-- =====================================================

-- Create partnerships table
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'active', 'paused', 'completed', 'dissolved')),
  revenue_split TEXT NOT NULL DEFAULT 'equal' CHECK (revenue_split IN ('equal', 'custom', 'percentage', 'milestone')),
  artist_split INTEGER NOT NULL DEFAULT 50 CHECK (artist_split >= 0 AND artist_split <= 100),
  engineer_split INTEGER NOT NULL DEFAULT 50 CHECK (engineer_split >= 0 AND engineer_split <= 100),
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  artist_earnings NUMERIC NOT NULL DEFAULT 0,
  engineer_earnings NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT valid_split CHECK (artist_split + engineer_split = 100),
  CONSTRAINT different_partners CHECK (artist_id != engineer_id)
);

-- Create indexes for partnerships
CREATE INDEX idx_partnerships_artist ON public.partnerships(artist_id);
CREATE INDEX idx_partnerships_engineer ON public.partnerships(engineer_id);
CREATE INDEX idx_partnerships_status ON public.partnerships(status);

-- RLS for partnerships
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their partnerships"
  ON public.partnerships FOR SELECT
  USING (auth.uid() = artist_id OR auth.uid() = engineer_id);

CREATE POLICY "Artists can create partnerships"
  ON public.partnerships FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Partners can update partnerships"
  ON public.partnerships FOR UPDATE
  USING (auth.uid() = artist_id OR auth.uid() = engineer_id);

-- Create collaborative_projects table
CREATE TABLE IF NOT EXISTS public.collaborative_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'track' CHECK (project_type IN ('track', 'remix', 'mastering', 'production', 'feature', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'completed', 'released')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_completion TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  artist_earnings NUMERIC NOT NULL DEFAULT 0,
  engineer_earnings NUMERIC NOT NULL DEFAULT 0,
  messages_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  milestone_count INTEGER NOT NULL DEFAULT 0,
  completed_milestones INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for collaborative_projects
CREATE INDEX idx_collaborative_projects_partnership ON public.collaborative_projects(partnership_id);
CREATE INDEX idx_collaborative_projects_status ON public.collaborative_projects(status);

-- RLS for collaborative_projects
ALTER TABLE public.collaborative_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view projects"
  ON public.collaborative_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = collaborative_projects.partnership_id
      AND (artist_id = auth.uid() OR engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partners can create projects"
  ON public.collaborative_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = collaborative_projects.partnership_id
      AND (artist_id = auth.uid() OR engineer_id = auth.uid())
      AND status IN ('accepted', 'active')
    )
  );

CREATE POLICY "Partners can update projects"
  ON public.collaborative_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = collaborative_projects.partnership_id
      AND (artist_id = auth.uid() OR engineer_id = auth.uid())
    )
  );

-- Create revenue_splits table
CREATE TABLE IF NOT EXISTS public.revenue_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE SET NULL,
  transaction_id TEXT,
  total_amount NUMERIC NOT NULL,
  artist_amount NUMERIC NOT NULL,
  engineer_amount NUMERIC NOT NULL,
  artist_percentage INTEGER NOT NULL,
  engineer_percentage INTEGER NOT NULL,
  split_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  split_status TEXT NOT NULL DEFAULT 'pending' CHECK (split_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for revenue_splits
CREATE INDEX idx_revenue_splits_partnership ON public.revenue_splits(partnership_id);
CREATE INDEX idx_revenue_splits_project ON public.revenue_splits(project_id);
CREATE INDEX idx_revenue_splits_status ON public.revenue_splits(split_status);

-- RLS for revenue_splits
ALTER TABLE public.revenue_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view revenue splits"
  ON public.revenue_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = revenue_splits.partnership_id
      AND (artist_id = auth.uid() OR engineer_id = auth.uid())
    )
  );

CREATE POLICY "System can insert revenue splits"
  ON public.revenue_splits FOR INSERT
  WITH CHECK (true);

-- Create payment_links table
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  token TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for payment_links
CREATE INDEX idx_payment_links_creator ON public.payment_links(creator_id);
CREATE INDEX idx_payment_links_recipient ON public.payment_links(recipient_id);
CREATE INDEX idx_payment_links_token ON public.payment_links(token);
CREATE INDEX idx_payment_links_status ON public.payment_links(status);

-- RLS for payment_links
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment links they created or received"
  ON public.payment_links FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create payment links"
  ON public.payment_links FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "System can update payment links"
  ON public.payment_links FOR UPDATE
  USING (true);

-- =====================================================
-- REFERRAL SYSTEM
-- =====================================================

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reward_type TEXT NOT NULL DEFAULT 'credit' CHECK (reward_type IN ('credit', 'discount', 'subscription_month')),
  reward_value NUMERIC NOT NULL,
  reward_description TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for referral_codes
CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_active ON public.referral_codes(is_active);

-- RLS for referral_codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active referral codes for validation"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  reward_given BOOLEAN NOT NULL DEFAULT false,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('credit', 'discount', 'subscription_month')),
  reward_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rewarded_at TIMESTAMPTZ,
  CONSTRAINT different_referral_users CHECK (referrer_id != referred_user_id)
);

-- Create indexes for referral_rewards
CREATE INDEX idx_referral_rewards_referrer ON public.referral_rewards(referrer_id);
CREATE INDEX idx_referral_rewards_referred ON public.referral_rewards(referred_user_id);
CREATE INDEX idx_referral_rewards_code ON public.referral_rewards(referral_code);

-- RLS for referral_rewards
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they made"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals they received"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = referred_user_id);

CREATE POLICY "System can insert referral rewards"
  ON public.referral_rewards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referral rewards"
  ON public.referral_rewards FOR UPDATE
  USING (true);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to get partnership metrics
CREATE OR REPLACE FUNCTION public.get_partnership_metrics(p_user_id UUID)
RETURNS TABLE (
  partnership_id UUID,
  total_projects BIGINT,
  completed_projects BIGINT,
  total_revenue NUMERIC,
  artist_total NUMERIC,
  engineer_total NUMERIC,
  active_conversations INTEGER,
  last_activity TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as partnership_id,
    COUNT(DISTINCT cp.id) as total_projects,
    COUNT(DISTINCT cp.id) FILTER (WHERE cp.status = 'completed') as completed_projects,
    COALESCE(SUM(rs.total_amount), 0) as total_revenue,
    COALESCE(SUM(rs.artist_amount), 0) as artist_total,
    COALESCE(SUM(rs.engineer_amount), 0) as engineer_total,
    COUNT(DISTINCT cp.id) FILTER (WHERE cp.messages_count > 0) as active_conversations,
    MAX(GREATEST(cp.created_at, COALESCE(cp.last_message_at, cp.created_at))) as last_activity
  FROM partnerships p
  LEFT JOIN collaborative_projects cp ON cp.partnership_id = p.id
  LEFT JOIN revenue_splits rs ON rs.partnership_id = p.id
  WHERE (p.artist_id = p_user_id OR p.engineer_id = p_user_id)
  GROUP BY p.id;
END;
$$;

-- Function to get partnership health scores
CREATE OR REPLACE FUNCTION public.get_partnership_health_scores(p_user_id UUID)
RETURNS TABLE (
  partnership_id UUID,
  health_score NUMERIC,
  activity_level NUMERIC,
  payment_reliability NUMERIC,
  risk_level TEXT,
  last_assessed TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as partnership_id,
    CASE 
      WHEN COUNT(cp.id) = 0 THEN 50.0
      ELSE LEAST(100.0, (
        (COUNT(cp.id) FILTER (WHERE cp.status = 'completed')::NUMERIC / NULLIF(COUNT(cp.id), 0) * 40) +
        (COUNT(rs.id) FILTER (WHERE rs.split_status = 'completed')::NUMERIC / NULLIF(COUNT(rs.id), 0) * 30) +
        (CASE WHEN MAX(cp.created_at) > now() - interval '30 days' THEN 30.0 ELSE 10.0 END)
      ))
    END as health_score,
    CASE 
      WHEN MAX(cp.created_at) > now() - interval '7 days' THEN 100.0
      WHEN MAX(cp.created_at) > now() - interval '30 days' THEN 70.0
      WHEN MAX(cp.created_at) > now() - interval '90 days' THEN 40.0
      ELSE 10.0
    END as activity_level,
    CASE 
      WHEN COUNT(rs.id) = 0 THEN 100.0
      ELSE (COUNT(rs.id) FILTER (WHERE rs.split_status = 'completed')::NUMERIC / COUNT(rs.id) * 100)
    END as payment_reliability,
    CASE 
      WHEN COUNT(cp.id) = 0 THEN 'low'
      WHEN COUNT(cp.id) FILTER (WHERE cp.status = 'completed')::NUMERIC / COUNT(cp.id) > 0.8 THEN 'low'
      WHEN COUNT(cp.id) FILTER (WHERE cp.status = 'completed')::NUMERIC / COUNT(cp.id) > 0.5 THEN 'medium'
      ELSE 'high'
    END as risk_level,
    now() as last_assessed
  FROM partnerships p
  LEFT JOIN collaborative_projects cp ON cp.partnership_id = p.id
  LEFT JOIN revenue_splits rs ON rs.partnership_id = p.id
  WHERE (p.artist_id = p_user_id OR p.engineer_id = p_user_id)
  GROUP BY p.id;
END;
$$;
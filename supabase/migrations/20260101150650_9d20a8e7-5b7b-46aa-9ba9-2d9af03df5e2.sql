-- Create user_journeys table for tracking journey state
CREATE TABLE public.user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_type TEXT NOT NULL,
  current_step TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, journey_type)
);

-- Create loyalty_tiers table for tier configuration
CREATE TABLE public.loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  tier_level INTEGER NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  benefits JSONB DEFAULT '{}',
  badge_icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_loyalty table for tracking user tier
CREATE TABLE public.user_loyalty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_tier TEXT NOT NULL DEFAULT 'bronze',
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  current_period_points INTEGER DEFAULT 0,
  tier_updated_at TIMESTAMPTZ,
  tier_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loyalty ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_journeys
CREATE POLICY "Users can view their own journeys"
ON public.user_journeys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journeys"
ON public.user_journeys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys"
ON public.user_journeys FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for loyalty_tiers (public read)
CREATE POLICY "Anyone can view loyalty tiers"
ON public.loyalty_tiers FOR SELECT
USING (true);

-- RLS policies for user_loyalty
CREATE POLICY "Users can view their own loyalty"
ON public.user_loyalty FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loyalty"
ON public.user_loyalty FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loyalty"
ON public.user_loyalty FOR UPDATE
USING (auth.uid() = user_id);

-- Insert default loyalty tiers
INSERT INTO public.loyalty_tiers (tier_name, tier_level, min_points, benefits, badge_icon, color) VALUES
('bronze', 1, 0, '{"discount_percent": 0, "priority_matching": false}', 'medal', '#CD7F32'),
('silver', 2, 500, '{"discount_percent": 5, "priority_matching": true}', 'award', '#C0C0C0'),
('gold', 3, 2000, '{"discount_percent": 10, "priority_matching": true, "free_preview": true}', 'crown', '#FFD700'),
('platinum', 4, 5000, '{"discount_percent": 15, "priority_matching": true, "free_preview": true, "vip_support": true}', 'gem', '#E5E4E2');

-- Create trigger for updated_at
CREATE TRIGGER update_user_journeys_updated_at
BEFORE UPDATE ON public.user_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_loyalty_updated_at
BEFORE UPDATE ON public.user_loyalty
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
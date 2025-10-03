-- Create A/B test variants table
CREATE TABLE IF NOT EXISTS public.ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  variant_config JSONB NOT NULL DEFAULT '{}',
  traffic_percentage NUMERIC DEFAULT 50 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  impressions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(test_name, variant_name)
);

-- Enable RLS
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can view active tests
CREATE POLICY "Everyone can view AB tests"
  ON public.ab_test_variants
  FOR SELECT
  USING (true);

-- Admins can manage tests
CREATE POLICY "Admins can manage AB tests"
  ON public.ab_test_variants
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create ad conversions tracking table
CREATE TABLE IF NOT EXISTS public.ad_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ad_conversions ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversions
CREATE POLICY "Users can view own conversions"
  ON public.ad_conversions
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert conversions
CREATE POLICY "System can insert conversions"
  ON public.ad_conversions
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all conversions
CREATE POLICY "Admins can view all conversions"
  ON public.ad_conversions
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_ab_test_variants_test_name ON public.ab_test_variants(test_name);
CREATE INDEX idx_ad_conversions_user_id ON public.ad_conversions(user_id);
CREATE INDEX idx_ad_conversions_utm_campaign ON public.ad_conversions(utm_campaign);
CREATE INDEX idx_ad_conversions_created_at ON public.ad_conversions(created_at DESC);
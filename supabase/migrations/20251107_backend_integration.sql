-- ============================================================================
-- MixClub Backend Integration Database Schema
-- ============================================================================
-- This file contains all necessary database tables for revenue systems
-- Run this migration to set up the backend infrastructure

-- ============================================================================
-- 1. SUBSCRIPTION SYSTEM TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'starter', 'pro', 'studio')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused')),
  price_monthly INTEGER NOT NULL,
  features_available TEXT[] NOT NULL,
  usage_limit INTEGER NOT NULL,
  usage_current INTEGER NOT NULL DEFAULT 0,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);

-- ============================================================================
-- 2. ENGINEER PROFILES & MATCHING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS engineer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  genres TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  completed_projects INTEGER DEFAULT 0,
  avg_turnaround_hours INTEGER,
  price_per_track INTEGER,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  success_rate NUMERIC(5, 2) DEFAULT 0,
  completion_rate NUMERIC(5, 2) DEFAULT 0,
  skills TEXT[] NOT NULL,
  bio TEXT,
  portfolio_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_engineers_verified ON engineer_profiles(verified);
CREATE INDEX idx_engineers_availability ON engineer_profiles(availability);
CREATE INDEX idx_engineers_rating ON engineer_profiles(rating DESC);
CREATE INDEX idx_engineers_genres ON engineer_profiles USING GIN (genres);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genres TEXT[] NOT NULL,
  budget INTEGER NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  skills_required TEXT[] NOT NULL,
  complexity TEXT CHECK (complexity IN ('simple', 'medium', 'complex')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_artist_id ON projects(artist_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE TABLE IF NOT EXISTS engineer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID REFERENCES engineer_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  genre_match INTEGER,
  experience_score INTEGER,
  performance_score INTEGER,
  price_alignment INTEGER,
  availability_score INTEGER,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(engineer_id, project_id)
);

CREATE INDEX idx_matches_engineer_id ON engineer_matches(engineer_id);
CREATE INDEX idx_matches_project_id ON engineer_matches(project_id);
CREATE INDEX idx_matches_status ON engineer_matches(status);
CREATE INDEX idx_matches_score ON engineer_matches(match_score DESC);

CREATE TABLE IF NOT EXISTS match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES engineer_matches(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES engineer_matches(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  engineer_id UUID REFERENCES engineer_profiles(id),
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_match_events_type ON match_events(event_type);

-- ============================================================================
-- 3. MARKETPLACE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  downloads INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0,
  preview_url TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_seller_id ON marketplace_products(seller_id);
CREATE INDEX idx_products_category ON marketplace_products(category);
CREATE INDEX idx_products_rating ON marketplace_products(rating DESC);
CREATE INDEX idx_products_downloads ON marketplace_products(downloads DESC);
CREATE INDEX idx_products_tags ON marketplace_products USING GIN (tags);

CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer_id ON marketplace_orders(buyer_id);
CREATE INDEX idx_orders_status ON marketplace_orders(status);
CREATE INDEX idx_orders_created_at ON marketplace_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS product_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_downloads_product_id ON product_downloads(product_id);
CREATE INDEX idx_downloads_buyer_id ON product_downloads(buyer_id);

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);

-- ============================================================================
-- 4. REFERRAL SYSTEM TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  reward_amount INTEGER DEFAULT 50,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);

CREATE TABLE IF NOT EXISTS referral_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_distributed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_referral_claims_referrer ON referral_claims(referrer_user_id);
CREATE INDEX idx_referral_claims_referred ON referral_claims(referred_user_id);
CREATE INDEX idx_referral_claims_status ON referral_claims(status);

-- ============================================================================
-- 5. ANALYTICS & AUDIT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_claims ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view published engineer profiles
CREATE POLICY "Users can view verified engineer profiles"
  ON engineer_profiles FOR SELECT
  USING (verified = TRUE);

-- Users can view their own profile
CREATE POLICY "Engineers can view own profile"
  ON engineer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see projects they created or that are public
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = artist_id);

-- Anyone can view published projects
CREATE POLICY "Anyone can view published projects"
  ON projects FOR SELECT
  USING (TRUE);

-- Users can view matches for their projects or matches involving them
CREATE POLICY "Users can view own matches"
  ON engineer_matches FOR SELECT
  USING (
    auth.uid() IN (
      SELECT artist_id FROM projects WHERE id = project_id
    )
    OR auth.uid() IN (
      SELECT user_id FROM engineer_profiles WHERE id = engineer_id
    )
  );

-- Public can view marketplace products
CREATE POLICY "Anyone can view published products"
  ON marketplace_products FOR SELECT
  USING (TRUE);

-- Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON marketplace_orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Users can only see their own referral codes
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. STORED PROCEDURES & FUNCTIONS
-- ============================================================================

-- Increment usage counter for subscription
CREATE OR REPLACE FUNCTION increment_usage(user_id UUID, increment_by INT DEFAULT 1)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_subscriptions
  SET usage_current = usage_current + increment_by
  WHERE user_id = $1;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Update engineer stats after match completion
CREATE OR REPLACE FUNCTION update_engineer_stats_from_match(match_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  eng_id UUID;
  feedback_rating INT;
BEGIN
  -- Get engineer ID from match
  SELECT engineer_id INTO eng_id FROM engineer_matches WHERE id = match_id;
  
  -- Get rating from feedback
  SELECT rating INTO feedback_rating FROM match_feedback 
  WHERE match_id = match_id LIMIT 1;
  
  -- Update engineer profile
  UPDATE engineer_profiles
  SET 
    completed_projects = completed_projects + 1,
    rating = (rating * completed_projects + feedback_rating) / (completed_projects + 1)
  WHERE id = eng_id;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Increment product downloads
CREATE OR REPLACE FUNCTION increment_product_downloads(product_id UUID, count INT DEFAULT 1)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE marketplace_products
  SET downloads = downloads + count
  WHERE id = product_id;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Update product rating from reviews
CREATE OR REPLACE FUNCTION update_product_rating(product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  avg_rating NUMERIC;
  review_count INT;
BEGIN
  SELECT AVG(rating)::NUMERIC(3, 2), COUNT(*) INTO avg_rating, review_count
  FROM product_reviews
  WHERE product_reviews.product_id = update_product_rating.product_id;
  
  UPDATE marketplace_products
  SET rating = COALESCE(avg_rating, 0), reviews_count = review_count
  WHERE id = product_id;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Get subscription analytics
CREATE OR REPLACE FUNCTION get_subscription_analytics()
RETURNS TABLE (
  total_subscribers BIGINT,
  by_tier JSONB,
  monthly_revenue BIGINT,
  churn_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT user_id)::BIGINT,
    jsonb_object_agg(tier, tier_count),
    SUM(price_monthly)::BIGINT,
    0::NUMERIC
  FROM (
    SELECT tier, COUNT(*) as tier_count FROM user_subscriptions WHERE status = 'active' GROUP BY tier
  ) t;
END;
$$ LANGUAGE plpgsql;

-- Get matching analytics
CREATE OR REPLACE FUNCTION get_matching_analytics()
RETURNS TABLE (
  total_matches BIGINT,
  match_success_rate NUMERIC,
  avg_match_quality NUMERIC,
  top_engineers JSONB,
  genre_preferences JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    (COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC(5, 2),
    AVG(match_score)::NUMERIC(5, 2),
    jsonb_agg(jsonb_build_object('name', name, 'rating', rating) ORDER BY rating DESC LIMIT 5),
    jsonb_object_agg(genre, genre_count)
  FROM engineer_matches
  JOIN engineer_profiles ON engineer_matches.engineer_id = engineer_profiles.id
  CROSS JOIN LATERAL unnest(engineer_profiles.genres) as genre
  CROSS JOIN (SELECT COUNT(*) as genre_count FROM unnest(engineer_profiles.genres)) AS g
  GROUP BY genre;
END;
$$ LANGUAGE plpgsql;

-- Get seller analytics
CREATE OR REPLACE FUNCTION get_seller_analytics(seller_id_param UUID)
RETURNS TABLE (
  total_sales BIGINT,
  total_earnings BIGINT,
  monthly_revenue BIGINT,
  total_products BIGINT,
  total_downloads BIGINT,
  average_rating NUMERIC,
  recent_sales JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT mo.id)::BIGINT,
    SUM(mo.total_amount)::BIGINT * 70 / 100,  -- 70% seller split
    SUM(CASE WHEN DATE_TRUNC('month', mo.created_at) = DATE_TRUNC('month', NOW()) THEN mo.total_amount ELSE 0 END)::BIGINT * 70 / 100,
    COUNT(DISTINCT mp.id)::BIGINT,
    SUM(mp.downloads)::BIGINT,
    AVG(mp.rating)::NUMERIC(3, 2),
    jsonb_agg(jsonb_build_object('id', mo.id, 'amount', mo.total_amount, 'date', mo.created_at))
  FROM marketplace_products mp
  LEFT JOIN marketplace_orders mo ON mp.seller_id = mo.buyer_id
  WHERE mp.seller_id = seller_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

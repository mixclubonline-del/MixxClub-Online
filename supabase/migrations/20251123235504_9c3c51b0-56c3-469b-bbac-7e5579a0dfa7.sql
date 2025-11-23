-- Create remaining tables for marketplace and services

-- Marketplace categories
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL UNIQUE,
  category_description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active categories"
  ON marketplace_categories FOR SELECT
  USING (is_active = true);

-- Marketplace items
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES marketplace_categories(id),
  item_name TEXT NOT NULL,
  item_description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  item_type TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  preview_urls TEXT[],
  status TEXT DEFAULT 'active',
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active items"
  ON marketplace_items FOR SELECT
  USING (status = 'active');

CREATE POLICY "Sellers can manage their items"
  ON marketplace_items FOR ALL
  USING (auth.uid() = seller_id);

-- Marketplace purchases
CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  purchase_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their purchases"
  ON marketplace_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view their sales"
  ON marketplace_purchases FOR SELECT
  USING (auth.uid() = seller_id);

-- Label partnerships
CREATE TABLE IF NOT EXISTS label_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_name TEXT NOT NULL,
  label_type TEXT,
  contact_email TEXT,
  partnership_status TEXT DEFAULT 'pending',
  revenue_share NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE label_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage partnerships"
  ON label_partnerships FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Label services
CREATE TABLE IF NOT EXISTS label_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  partnership_id UUID REFERENCES label_partnerships(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE label_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active services"
  ON label_services FOR SELECT
  USING (is_active = true);

-- Label service requests
CREATE TABLE IF NOT EXISTS label_service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES label_services(id) ON DELETE CASCADE,
  request_status TEXT DEFAULT 'pending',
  submission_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE label_service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their requests"
  ON label_service_requests FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create requests"
  ON label_service_requests FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

-- Streaming connections (integrations)
CREATE TABLE IF NOT EXISTS streaming_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  connection_status TEXT DEFAULT 'disconnected',
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  profile_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE streaming_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their connections"
  ON streaming_connections FOR ALL
  USING (auth.uid() = user_id);

-- Mastering subscriptions
CREATE TABLE IF NOT EXISTS user_mastering_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES mastering_packages(id) ON DELETE CASCADE,
  tracks_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE user_mastering_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions"
  ON user_mastering_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Mixing packages
CREATE TABLE IF NOT EXISTS mixing_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  track_limit INTEGER,
  turnaround_days INTEGER,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE mixing_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active packages"
  ON mixing_packages FOR SELECT
  USING (is_active = true);

-- Mixing subscriptions
CREATE TABLE IF NOT EXISTS user_mixing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES mixing_packages(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  tracks_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE user_mixing_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions"
  ON user_mixing_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Add missing columns to job_postings for opportunities
ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'mixing',
  ADD COLUMN IF NOT EXISTS estimated_duration TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_streaming_connections_user ON streaming_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_label_requests_artist ON label_service_requests(artist_id);
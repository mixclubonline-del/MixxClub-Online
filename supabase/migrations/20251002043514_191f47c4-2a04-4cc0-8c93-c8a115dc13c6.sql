-- Tier 3: Community Marketplace & Label Services Integration
-- Marketplace Expansion Tables

-- Marketplace categories
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL UNIQUE,
  category_description TEXT,
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace items (samples, presets, templates)
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('sample_pack', 'preset', 'template', 'plugin')),
  price NUMERIC NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  file_path TEXT,
  file_size BIGINT,
  preview_audio_path TEXT,
  thumbnail_url TEXT,
  demo_video_url TEXT,
  download_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  technical_specs JSONB DEFAULT '{}',
  compatibility JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Marketplace purchases
CREATE TABLE IF NOT EXISTS public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.marketplace_items(id) ON DELETE CASCADE NOT NULL,
  purchase_price NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'stripe',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  download_url TEXT,
  download_expires_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(buyer_id, item_id)
);

-- Marketplace reviews
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.marketplace_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(item_id, user_id)
);

-- Label Services Tables

-- Label partnerships
CREATE TABLE IF NOT EXISTS public.label_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_name TEXT NOT NULL,
  label_description TEXT,
  logo_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  genres_specialized TEXT[] DEFAULT '{}',
  years_established INTEGER,
  total_artists INTEGER DEFAULT 0,
  partnership_tier TEXT NOT NULL DEFAULT 'standard' CHECK (partnership_tier IN ('standard', 'premium', 'elite')),
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  social_links JSONB DEFAULT '{}',
  success_stories JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Label services offered
CREATE TABLE IF NOT EXISTS public.label_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID REFERENCES public.label_partnerships(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('distribution', 'marketing', 'a&r', 'publishing', 'sync_licensing', 'playlist_pitching', 'pr', 'full_package')),
  service_description TEXT,
  base_price NUMERIC,
  pricing_model TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_model IN ('fixed', 'percentage', 'hybrid', 'custom')),
  revenue_split_percentage NUMERIC,
  features TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  turnaround_days INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Label service requests from artists
CREATE TABLE IF NOT EXISTS public.label_service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.label_services(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.label_partnerships(id) ON DELETE CASCADE NOT NULL,
  request_message TEXT NOT NULL,
  artist_links JSONB DEFAULT '{}',
  audio_samples TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'in_progress', 'completed')),
  label_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seller earnings from marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.marketplace_items(id) ON DELETE CASCADE NOT NULL,
  purchase_id UUID REFERENCES public.marketplace_purchases(id) ON DELETE CASCADE NOT NULL,
  gross_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
  payout_date TIMESTAMP WITH TIME ZONE,
  stripe_transfer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Marketplace Categories (Public Read)
CREATE POLICY "Everyone can view active categories"
  ON public.marketplace_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.marketplace_categories FOR ALL
  USING (is_admin(auth.uid()));

-- Marketplace Items
CREATE POLICY "Everyone can view published items"
  ON public.marketplace_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Sellers can manage their own items"
  ON public.marketplace_items FOR ALL
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all items"
  ON public.marketplace_items FOR ALL
  USING (is_admin(auth.uid()));

-- Marketplace Purchases
CREATE POLICY "Users can view their own purchases"
  ON public.marketplace_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create purchases"
  ON public.marketplace_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view purchases of their items"
  ON public.marketplace_purchases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM marketplace_items
    WHERE marketplace_items.id = marketplace_purchases.item_id
    AND marketplace_items.seller_id = auth.uid()
  ));

-- Marketplace Reviews
CREATE POLICY "Everyone can view reviews"
  ON public.marketplace_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for purchased items"
  ON public.marketplace_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM marketplace_purchases
      WHERE marketplace_purchases.item_id = marketplace_reviews.item_id
      AND marketplace_purchases.buyer_id = auth.uid()
      AND marketplace_purchases.payment_status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON public.marketplace_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Label Partnerships
CREATE POLICY "Everyone can view active label partnerships"
  ON public.label_partnerships FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage label partnerships"
  ON public.label_partnerships FOR ALL
  USING (is_admin(auth.uid()));

-- Label Services
CREATE POLICY "Everyone can view available label services"
  ON public.label_services FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage label services"
  ON public.label_services FOR ALL
  USING (is_admin(auth.uid()));

-- Label Service Requests
CREATE POLICY "Artists can view their own requests"
  ON public.label_service_requests FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create requests"
  ON public.label_service_requests FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Admins can view all requests"
  ON public.label_service_requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update requests"
  ON public.label_service_requests FOR UPDATE
  USING (is_admin(auth.uid()));

-- Marketplace Earnings
CREATE POLICY "Sellers can view their own earnings"
  ON public.marketplace_earnings FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all earnings"
  ON public.marketplace_earnings FOR SELECT
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller ON public.marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON public.marketplace_items(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON public.marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_item ON public.marketplace_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_item ON public.marketplace_reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_label_services_label ON public.label_services(label_id);
CREATE INDEX IF NOT EXISTS idx_label_requests_artist ON public.label_service_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_requests_service ON public.label_service_requests(service_id);

-- Tier 3 milestone
INSERT INTO public.community_milestones (
  feature_key,
  milestone_name,
  milestone_description,
  milestone_type,
  target_value,
  current_value,
  display_order,
  icon_name,
  reward_description
) VALUES (
  'TIER_3_MARKETPLACE_LABELS',
  'Tier 3: Community Marketplace',
  'Unlock marketplace for samples, presets, templates and label services integration',
  'user_count',
  500,
  0,
  3,
  'store',
  'Sample Packs, Presets, Templates Marketplace, Label Services, Distribution Deals'
) ON CONFLICT (feature_key) DO NOTHING;
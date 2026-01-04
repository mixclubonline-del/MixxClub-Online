-- =============================================
-- PHASE 1: Database Foundation for Storefronts + Music Catalogue + Playlists
-- =============================================

-- 1. User Storefronts Table
CREATE TABLE public.user_storefronts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  storefront_slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  banner_url TEXT,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#9b87f5',
  social_links JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  stripe_account_id TEXT,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Tracks (Music Catalogue)
CREATE TABLE public.user_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  artwork_url TEXT,
  duration_seconds NUMERIC,
  genre TEXT,
  bpm INTEGER,
  key_signature TEXT,
  is_public BOOLEAN DEFAULT false,
  is_for_sale BOOLEAN DEFAULT false,
  price NUMERIC(10,2),
  license_type TEXT DEFAULT 'stream_only',
  play_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  collaboration_credits JSONB DEFAULT '[]',
  source_project_id UUID,
  source_premiere_id UUID,
  release_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Merch Products Table
CREATE TABLE public.merch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID REFERENCES public.user_storefronts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  images JSONB DEFAULT '[]',
  price NUMERIC(10,2) NOT NULL,
  category TEXT DEFAULT 'apparel',
  is_active BOOLEAN DEFAULT true,
  inventory_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Merch Variants Table
CREATE TABLE public.merch_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.merch_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  price NUMERIC(10,2) NOT NULL,
  sku TEXT,
  image_url TEXT,
  inventory_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Playlists Table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_collaborative BOOLEAN DEFAULT false,
  track_count INTEGER DEFAULT 0,
  total_duration NUMERIC DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Playlist Tracks Table
CREATE TABLE public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.user_tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_by UUID,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- 7. Listening History Table
CREATE TABLE public.listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track_id UUID REFERENCES public.user_tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT now(),
  duration_played NUMERIC,
  source TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.user_storefronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- User Storefronts Policies
CREATE POLICY "Anyone can view active storefronts"
  ON public.user_storefronts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can manage their own storefront"
  ON public.user_storefronts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Tracks Policies
CREATE POLICY "Anyone can view public tracks"
  ON public.user_tracks FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own tracks"
  ON public.user_tracks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tracks"
  ON public.user_tracks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Merch Products Policies
CREATE POLICY "Anyone can view active products"
  ON public.merch_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can manage their own products"
  ON public.merch_products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Merch Variants Policies
CREATE POLICY "Anyone can view variants of active products"
  ON public.merch_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.merch_products 
    WHERE id = merch_variants.product_id AND is_active = true
  ));

CREATE POLICY "Product owners can manage variants"
  ON public.merch_variants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.merch_products 
    WHERE id = merch_variants.product_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.merch_products 
    WHERE id = merch_variants.product_id AND user_id = auth.uid()
  ));

-- Playlists Policies
CREATE POLICY "Anyone can view public playlists"
  ON public.playlists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlists"
  ON public.playlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Playlist Tracks Policies
CREATE POLICY "Anyone can view tracks of public playlists"
  ON public.playlist_tracks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE id = playlist_tracks.playlist_id AND is_public = true
  ));

CREATE POLICY "Playlist owners can view their playlist tracks"
  ON public.playlist_tracks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE id = playlist_tracks.playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Playlist owners can manage playlist tracks"
  ON public.playlist_tracks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE id = playlist_tracks.playlist_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE id = playlist_tracks.playlist_id AND user_id = auth.uid()
  ));

-- Listening History Policies
CREATE POLICY "Users can view their own listening history"
  ON public.listening_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their listening history"
  ON public.listening_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_user_tracks_user_id ON public.user_tracks(user_id);
CREATE INDEX idx_user_tracks_is_public ON public.user_tracks(is_public);
CREATE INDEX idx_user_tracks_genre ON public.user_tracks(genre);
CREATE INDEX idx_user_tracks_created_at ON public.user_tracks(created_at DESC);
CREATE INDEX idx_merch_products_storefront ON public.merch_products(storefront_id);
CREATE INDEX idx_merch_products_user ON public.merch_products(user_id);
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist ON public.playlist_tracks(playlist_id);
CREATE INDEX idx_listening_history_user ON public.listening_history(user_id);
CREATE INDEX idx_listening_history_played ON public.listening_history(played_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps trigger
CREATE TRIGGER update_user_storefronts_updated_at
  BEFORE UPDATE ON public.user_storefronts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tracks_updated_at
  BEFORE UPDATE ON public.user_tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merch_products_updated_at
  BEFORE UPDATE ON public.merch_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Create artist_storefronts table
CREATE TABLE public.artist_storefronts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storefront_slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  banner_image_url TEXT,
  commission_rate NUMERIC NOT NULL DEFAULT 0.20,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_id)
);

-- Add artist_id to merch_products
ALTER TABLE public.merch_products 
ADD COLUMN artist_id UUID REFERENCES public.artist_storefronts(id) ON DELETE SET NULL;

-- Create merch_sales table for commission tracking
CREATE TABLE public.merch_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.merch_products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL,
  artist_id UUID REFERENCES public.artist_storefronts(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sale_amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.artist_storefronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_storefronts
CREATE POLICY "Anyone can view approved storefronts"
  ON public.artist_storefronts FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Artists can view their own storefront"
  ON public.artist_storefronts FOR SELECT
  USING (artist_id = auth.uid());

CREATE POLICY "Artists can create their own storefront"
  ON public.artist_storefronts FOR INSERT
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Artists can update their own storefront"
  ON public.artist_storefronts FOR UPDATE
  USING (artist_id = auth.uid());

CREATE POLICY "Admins can manage all storefronts"
  ON public.artist_storefronts FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for merch_sales
CREATE POLICY "Artists can view their own sales"
  ON public.merch_sales FOR SELECT
  USING (artist_id IN (SELECT id FROM artist_storefronts WHERE artist_id = auth.uid()));

CREATE POLICY "Admins can view all sales"
  ON public.merch_sales FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert sales"
  ON public.merch_sales FOR INSERT
  WITH CHECK (true);

-- Update merch_products RLS to allow artists to insert their products
CREATE POLICY "Artists can create products for their storefront"
  ON public.merch_products FOR INSERT
  WITH CHECK (
    artist_id IN (SELECT id FROM artist_storefronts WHERE artist_id = auth.uid())
  );

CREATE POLICY "Artists can view their own products"
  ON public.merch_products FOR SELECT
  USING (
    is_active = true OR 
    artist_id IN (SELECT id FROM artist_storefronts WHERE artist_id = auth.uid())
  );

-- Create index for performance
CREATE INDEX idx_merch_products_artist_id ON public.merch_products(artist_id);
CREATE INDEX idx_artist_storefronts_slug ON public.artist_storefronts(storefront_slug);
CREATE INDEX idx_merch_sales_artist_id ON public.merch_sales(artist_id);
CREATE INDEX idx_merch_sales_sale_date ON public.merch_sales(sale_date DESC);
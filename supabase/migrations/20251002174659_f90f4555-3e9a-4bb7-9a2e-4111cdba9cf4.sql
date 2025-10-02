-- Create merch_products table
CREATE TABLE IF NOT EXISTS public.merch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printful_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create merch_variants table
CREATE TABLE IF NOT EXISTS public.merch_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.merch_products(id) ON DELETE CASCADE,
  printful_variant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  size TEXT,
  color TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view active products
CREATE POLICY "Everyone can view active merch products"
  ON public.merch_products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Everyone can view available variants"
  ON public.merch_variants
  FOR SELECT
  USING (is_available = true);

-- Admins can manage products
CREATE POLICY "Admins can manage merch products"
  ON public.merch_products
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage merch variants"
  ON public.merch_variants
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merch_products_printful_id ON public.merch_products(printful_id);
CREATE INDEX IF NOT EXISTS idx_merch_variants_product_id ON public.merch_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_merch_variants_printful_id ON public.merch_variants(printful_variant_id);
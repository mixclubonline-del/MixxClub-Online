-- =============================================
-- MixClub Store - Database Schema
-- Phase 1: Extend marketplace_items for physical products
-- =============================================

-- Extend marketplace_items table for physical products
ALTER TABLE marketplace_items 
  ADD COLUMN IF NOT EXISTS physical_product BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS printful_product_id BIGINT,
  ADD COLUMN IF NOT EXISTS printful_variant_id BIGINT,
  ADD COLUMN IF NOT EXISTS size_options JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS color_options JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS design_file_url TEXT,
  ADD COLUMN IF NOT EXISTS mockup_images JSONB DEFAULT '[]';

-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for shipping_addresses
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses"
  ON shipping_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own addresses"
  ON shipping_addresses FOR ALL
  USING (auth.uid() = user_id);

-- Create order_fulfillment table
CREATE TABLE IF NOT EXISTS order_fulfillment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES marketplace_purchases(id) ON DELETE CASCADE NOT NULL,
  shipping_address_id UUID REFERENCES shipping_addresses(id),
  printful_order_id TEXT,
  tracking_number TEXT,
  carrier TEXT,
  shipping_status TEXT DEFAULT 'pending',
  printful_status TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for order_fulfillment
ALTER TABLE order_fulfillment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON order_fulfillment FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM marketplace_purchases mp
    WHERE mp.id = order_fulfillment.purchase_id
    AND mp.buyer_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all orders"
  ON order_fulfillment FOR ALL
  USING (is_admin(auth.uid()));

-- Create engineer_preset_packs table
CREATE TABLE IF NOT EXISTS engineer_preset_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_item_id UUID REFERENCES marketplace_items(id) ON DELETE CASCADE NOT NULL,
  engineer_id UUID NOT NULL,
  pack_name TEXT NOT NULL,
  pack_description TEXT,
  plugin_compatibility JSONB DEFAULT '[]',
  preset_count INTEGER NOT NULL,
  genre_optimized TEXT[] DEFAULT '{}',
  demo_audio_url TEXT,
  file_formats TEXT[] DEFAULT '{}',
  installation_guide TEXT,
  daw_compatibility TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for engineer_preset_packs
ALTER TABLE engineer_preset_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers can manage their own packs"
  ON engineer_preset_packs FOR ALL
  USING (auth.uid() = engineer_id);

CREATE POLICY "Everyone can view published packs"
  ON engineer_preset_packs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM marketplace_items mi
    WHERE mi.id = engineer_preset_packs.marketplace_item_id
    AND mi.is_published = true
  ));

-- Extend marketplace_purchases for cart functionality
ALTER TABLE marketplace_purchases
  ADD COLUMN IF NOT EXISTS cart_items JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  min_purchase_amount NUMERIC,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  applicable_to TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for discount_codes
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillment_purchase_id ON order_fulfillment(purchase_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillment_shipping_status ON order_fulfillment(shipping_status);
CREATE INDEX IF NOT EXISTS idx_engineer_preset_packs_engineer_id ON engineer_preset_packs(engineer_id);
CREATE INDEX IF NOT EXISTS idx_engineer_preset_packs_marketplace_item_id ON engineer_preset_packs(marketplace_item_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_physical_product ON marketplace_items(physical_product);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_fulfillment_updated_at
  BEFORE UPDATE ON order_fulfillment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engineer_preset_packs_updated_at
  BEFORE UPDATE ON engineer_preset_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
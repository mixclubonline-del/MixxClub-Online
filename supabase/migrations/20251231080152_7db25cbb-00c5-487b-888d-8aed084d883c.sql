-- Add category column to brand_assets table for organizational grouping
ALTER TABLE public.brand_assets 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'uncategorized';

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_brand_assets_category ON public.brand_assets(category);
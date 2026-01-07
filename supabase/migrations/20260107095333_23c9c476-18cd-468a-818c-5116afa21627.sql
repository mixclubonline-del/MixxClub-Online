-- Add video support metadata to brand_assets
ALTER TABLE brand_assets ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC;
ALTER TABLE brand_assets ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

-- Add index for fast active asset queries by context
CREATE INDEX IF NOT EXISTS idx_brand_assets_context_active 
ON brand_assets(asset_context, is_active) 
WHERE is_active = true;

-- Enable realtime for brand_assets
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_assets;
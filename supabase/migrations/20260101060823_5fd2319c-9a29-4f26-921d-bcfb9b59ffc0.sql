-- Drop the existing constraint and add one that allows prime_ prefixed values
ALTER TABLE brand_assets DROP CONSTRAINT brand_assets_asset_context_check;

ALTER TABLE brand_assets ADD CONSTRAINT brand_assets_asset_context_check 
CHECK (asset_context = ANY (ARRAY[
  'hero', 'navigation', 'favicon', 'splash', 'background', 'general',
  'prime_drop', 'prime_awakening', 'prime_mission', 'prime_analysis', 
  'prime_studio', 'prime_collaboration', 'prime_results', 'prime_crm', 'prime_cta'
]));
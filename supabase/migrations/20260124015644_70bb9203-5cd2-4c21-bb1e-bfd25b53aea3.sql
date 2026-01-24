-- Create prime_brand_assets table for storing canonical visual references
CREATE TABLE IF NOT EXISTS public.prime_brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('video-reference', 'image-reference', 'voice-sample', 'style-guide', 'thumbnail')),
  name TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  usage_context TEXT[],
  is_canonical BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prime_brand_assets ENABLE ROW LEVEL SECURITY;

-- Public read access (brand assets are public)
CREATE POLICY "Brand assets are publicly readable"
  ON public.prime_brand_assets FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage brand assets"
  ON public.prime_brand_assets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add visual_identity column to prime_persona_config
ALTER TABLE public.prime_persona_config 
ADD COLUMN IF NOT EXISTS visual_identity JSONB DEFAULT '{}'::jsonb;

-- Update the existing Prime persona with visual identity DNA
UPDATE public.prime_persona_config
SET visual_identity = jsonb_build_object(
  'character_appearance', jsonb_build_object(
    'description', 'Professional Black male engineer, studio environment, confident presence',
    'lighting', 'Warm studio lighting with subtle neon/cyan accents',
    'framing', 'Medium shot, direct eye contact with camera',
    'energy', 'Calm authority, OG veteran vibe - not hyperactive',
    'attire', 'Professional studio attire, understated luxury'
  ),
  'video_style', jsonb_build_object(
    'duration_tiktok', '15-60 seconds',
    'duration_reels', '15-60 seconds',
    'duration_twitter', '30-120 seconds',
    'motion', 'Subtle natural movement, not static freeze',
    'background', 'Professional studio with mixing console visible',
    'text_overlay_style', 'Bold statements as captions, brand colors (cyan/magenta accents)',
    'transitions', 'Smooth, professional - no flashy gimmicks'
  ),
  'voice_characteristics', jsonb_build_object(
    'tone', 'Authoritative but approachable',
    'pacing', 'Deliberate, not rushed',
    'style', 'Industry veteran sharing wisdom'
  ),
  'canonical_references', ARRAY['brand-assets/gemini_generated_video_A43C4AE7.mp4']
),
updated_at = now()
WHERE id = 'default';

-- Insert the canonical video reference
INSERT INTO public.prime_brand_assets (
  asset_type,
  name,
  description,
  storage_path,
  public_url,
  usage_context,
  is_canonical,
  metadata
) VALUES (
  'video-reference',
  'Prime Canonical Talking Head',
  'The definitive visual reference for Prime''s on-camera presence. OG engineer vibe, studio setting, confident authority.',
  'brand-assets/gemini_generated_video_A43C4AE7.mp4',
  'https://kbbrehnyqpulbxyesril.supabase.co/storage/v1/object/public/brand-assets/gemini_generated_video_A43C4AE7.mp4',
  ARRAY['talking-head', 'hot-take', 'production-tip', 'trend-reaction'],
  true,
  jsonb_build_object(
    'source', 'gemini-veo',
    'registered_at', now(),
    'notes', 'Primary reference for all Prime video content generation'
  )
);

-- Create index for quick canonical asset lookup
CREATE INDEX IF NOT EXISTS idx_prime_brand_assets_canonical ON public.prime_brand_assets(asset_type, is_canonical) WHERE is_canonical = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_prime_brand_assets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_prime_brand_assets_updated_at ON public.prime_brand_assets;
CREATE TRIGGER update_prime_brand_assets_updated_at
BEFORE UPDATE ON public.prime_brand_assets
FOR EACH ROW EXECUTE FUNCTION public.update_prime_brand_assets_timestamp();
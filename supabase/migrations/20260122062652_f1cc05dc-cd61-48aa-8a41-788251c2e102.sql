-- Phase 1: Dream Engine v2.0 - Extensible Context System

-- 1.1 Create asset_contexts reference table
CREATE TABLE public.asset_contexts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  context_prefix TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_contexts ENABLE ROW LEVEL SECURITY;

-- Public read access (contexts are public metadata)
CREATE POLICY "Anyone can view asset contexts"
ON public.asset_contexts FOR SELECT
USING (true);

-- Only admins can modify contexts
CREATE POLICY "Admins can manage asset contexts"
ON public.asset_contexts FOR ALL
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 1.2 Seed initial contexts
INSERT INTO public.asset_contexts (context_prefix, name, description, icon) VALUES
  ('landing_', 'Landing Page', 'Hero images, backgrounds, and promotional visuals', 'layout'),
  ('prime_', 'Prime Character', 'Prime AI assistant character poses and expressions', 'bot'),
  ('studio_', 'Studio Visuals', 'DAW backgrounds, studio environments, and textures', 'music'),
  ('hallway_', 'Hallway Scenes', 'Transitional and navigation visuals', 'door-open'),
  ('room_', 'Room Interiors', 'Virtual room environments and backgrounds', 'home'),
  ('unlock_', 'Unlock Celebrations', 'Achievement and milestone celebration art', 'trophy'),
  ('community_', 'Community Events', 'Community milestones and social visuals', 'users'),
  ('economy_', 'Economy/MixxCoinz', 'Currency icons, coin art, and economy visuals', 'coins'),
  ('vault_', 'Vault Items', 'Premium content and vault-related imagery', 'lock'),
  ('merch_', 'Merchandise', 'Product mockups and merchandise visuals', 'shopping-bag'),
  ('course_', 'Course Content', 'Educational thumbnails and course imagery', 'graduation-cap'),
  ('badge_', 'Badges & Awards', 'Achievement badges and award icons', 'award'),
  ('promo_', 'Promotional', 'Marketing and promotional campaign visuals', 'megaphone');

-- 1.3 Drop the old hardcoded check constraint
ALTER TABLE public.brand_assets DROP CONSTRAINT IF EXISTS brand_assets_asset_context_check;

-- 1.4 Create validation function that checks against the reference table
CREATE OR REPLACE FUNCTION public.validate_asset_context()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.asset_context IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.asset_contexts 
      WHERE NEW.asset_context LIKE context_prefix || '%'
    ) THEN
      RAISE EXCEPTION 'Invalid asset_context: %. Must match a registered prefix from asset_contexts table.', NEW.asset_context;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1.5 Create trigger for validation
DROP TRIGGER IF EXISTS check_asset_context ON public.brand_assets;
CREATE TRIGGER check_asset_context
BEFORE INSERT OR UPDATE ON public.brand_assets
FOR EACH ROW EXECUTE FUNCTION public.validate_asset_context();

-- 1.6 Create generation_history table for tracking all generations
CREATE TABLE public.generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  mode TEXT NOT NULL CHECK (mode IN ('image', 'video', 'audio', 'speech', 'image-edit')),
  prompt TEXT NOT NULL,
  context TEXT,
  provider TEXT NOT NULL,
  result_url TEXT,
  saved_asset_id UUID REFERENCES public.brand_assets(id) ON DELETE SET NULL,
  generation_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on generation_history
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own generation history
CREATE POLICY "Users can view own generation history"
ON public.generation_history FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can insert own generations"
ON public.generation_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all generation history
CREATE POLICY "Admins can view all generation history"
ON public.generation_history FOR SELECT
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add index for faster queries
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_context ON public.generation_history(context);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);
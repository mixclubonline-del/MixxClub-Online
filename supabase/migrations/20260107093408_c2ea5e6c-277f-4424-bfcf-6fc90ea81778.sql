-- ============================================
-- COMMUNITY UNLOCKABLES TABLE
-- Tracks platform-wide milestones and unlocks
-- ============================================

CREATE TABLE public.community_unlockables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('users', 'sessions', 'tracks', 'projects', 'earnings')),
  threshold_value INTEGER NOT NULL,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  unlock_order INTEGER DEFAULT 0,
  visual_asset_id UUID REFERENCES public.brand_assets(id),
  unlockable_type TEXT DEFAULT 'feature' CHECK (unlockable_type IN ('feature', 'wing', 'celebration', 'tool')),
  icon_name TEXT DEFAULT 'star',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_unlockables ENABLE ROW LEVEL SECURITY;

-- Everyone can read unlockables (public progress)
CREATE POLICY "Anyone can view community unlockables"
ON public.community_unlockables
FOR SELECT
USING (true);

-- Only admins can modify unlockables
CREATE POLICY "Admins can manage community unlockables"
ON public.community_unlockables
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_community_unlockables_updated_at
BEFORE UPDATE ON public.community_unlockables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for unlockables
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_unlockables;

-- ============================================
-- SEED INITIAL UNLOCKABLES
-- ============================================

INSERT INTO public.community_unlockables (name, description, threshold_type, threshold_value, unlock_order, unlockable_type, icon_name) VALUES
('First Light', 'The studio complex awakens with its first member', 'users', 1, 1, 'celebration', 'sun'),
('The Collective', '10 creators have joined the movement', 'users', 10, 2, 'celebration', 'users'),
('Mix Battles Arena', 'Community unlocks head-to-head mixing battles', 'users', 50, 3, 'feature', 'swords'),
('Session Surge', 'First 25 collaboration sessions created', 'sessions', 25, 4, 'celebration', 'activity'),
('The East Wing', 'New studio complex wing opens at 100 members', 'users', 100, 5, 'wing', 'building'),
('Project Milestone', '100 projects delivered through the platform', 'projects', 100, 6, 'celebration', 'trophy'),
('Advanced AI Mastering', 'Community unlocks premium AI mastering presets', 'users', 250, 7, 'tool', 'sparkles'),
('The Tower', 'Central hub tower unlocks at 500 members', 'users', 500, 8, 'wing', 'landmark'),
('Thousand Strong', 'The MixClub community reaches 1000 members', 'users', 1000, 9, 'celebration', 'crown');

-- ============================================
-- UPDATE BRAND ASSETS CONSTRAINT
-- Allow new asset contexts for studio hallway
-- ============================================

-- First drop the existing constraint
ALTER TABLE public.brand_assets 
DROP CONSTRAINT IF EXISTS brand_assets_asset_context_check;

-- Add updated constraint with all needed contexts
ALTER TABLE public.brand_assets
ADD CONSTRAINT brand_assets_asset_context_check
CHECK (
  asset_context IS NULL OR 
  asset_context ~ '^(landing_|prime_|studio_|hallway_|room_|unlock_|community_)'
);

-- Add index for faster asset lookups by context
CREATE INDEX IF NOT EXISTS idx_brand_assets_context_active 
ON public.brand_assets (asset_context, is_active, created_at DESC)
WHERE asset_context IS NOT NULL;
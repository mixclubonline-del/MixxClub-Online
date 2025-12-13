-- Create unlockables table (community, artist, engineer tracks)
CREATE TABLE public.unlockables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unlock_type TEXT NOT NULL CHECK (unlock_type IN ('community', 'artist', 'engineer')),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'trophy',
  metric_type TEXT NOT NULL, -- users, sessions, projects, deliverables, ratings, etc.
  target_value INTEGER NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  reward_description TEXT,
  feature_flag_key TEXT,
  tier INTEGER DEFAULT 1 CHECK (tier >= 1 AND tier <= 10),
  created_by TEXT DEFAULT 'system', -- 'system', 'prime_ai', or user_id
  ai_reasoning TEXT, -- Prime's explanation
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_unlockables for individual artist/engineer progress
CREATE TABLE public.user_unlockables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unlockable_id UUID NOT NULL REFERENCES public.unlockables(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, unlockable_id)
);

-- Enable RLS
ALTER TABLE public.unlockables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlockables ENABLE ROW LEVEL SECURITY;

-- Unlockables policies (public read)
CREATE POLICY "Everyone can view unlockables" 
ON public.unlockables FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage unlockables" 
ON public.unlockables FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- User unlockables policies
CREATE POLICY "Users can view their own unlockables" 
ON public.user_unlockables FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own unlockables" 
ON public.user_unlockables FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_unlockables_type ON public.unlockables(unlock_type);
CREATE INDEX idx_unlockables_tier ON public.unlockables(tier);
CREATE INDEX idx_user_unlockables_user ON public.user_unlockables(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_unlockables_updated_at
BEFORE UPDATE ON public.unlockables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_unlockables_updated_at
BEFORE UPDATE ON public.user_unlockables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial unlockables (Prime AI generated)

-- Community Unlockables
INSERT INTO public.unlockables (unlock_type, name, description, icon_name, metric_type, target_value, tier, sort_order, created_by, ai_reasoning, reward_description) VALUES
('community', 'The First 50', 'Reach 50 community members', 'users', 'user_count', 50, 1, 1, 'prime_ai', 'Fifty pioneers mark the beginning. When 50 creators believe in something, it becomes real.', 'Mix Battles Arena unlocked for the entire community'),
('community', 'Century Club', 'Reach 100 community members', 'award', 'user_count', 100, 2, 2, 'prime_ai', 'A hundred heads means a hundred perspectives worth sharing. This is when knowledge becomes collective.', 'Knowledge Center with courses and tutorials'),
('community', 'The Movement', 'Reach 250 community members', 'trending-up', 'user_count', 250, 3, 3, 'prime_ai', 'Two-fifty is critical mass. The market works when supply meets demand at scale.', 'Community Marketplace for beats, samples, and services'),
('community', 'Half-K Strong', 'Reach 500 community members', 'zap', 'user_count', 500, 4, 4, 'prime_ai', 'Scale demands infrastructure. At 500, API integrations and plugins make sense for power users.', 'API Access & Third-Party Integrations'),
('community', 'The Thousand', 'Reach 1,000 community members', 'crown', 'user_count', 1000, 5, 5, 'prime_ai', 'A thousand strong can negotiate label-tier deals. This is when MixClub becomes an industry force.', 'White-Label Distribution & Label Partnerships');

-- Artist Unlockables
INSERT INTO public.unlockables (unlock_type, name, description, icon_name, metric_type, target_value, tier, sort_order, created_by, ai_reasoning, reward_description) VALUES
('artist', 'First Session', 'Complete your first collaboration session', 'play', 'sessions_completed', 1, 1, 1, 'prime_ai', 'First session = commitment unlocked. You are in the game now.', 'AI Matching Priority Badge'),
('artist', 'Getting Serious', 'Complete 5 collaboration sessions', 'music', 'sessions_completed', 5, 2, 2, 'prime_ai', 'Five sessions means you know what you want. Here is the good stuff.', 'Premium AI Mastering Presets'),
('artist', 'Regular', 'Complete 10 collaboration sessions', 'star', 'sessions_completed', 10, 3, 3, 'prime_ai', 'Ten sessions? You are a regular. Let us show you off.', 'Featured Artist Spotlight'),
('artist', 'Power User', 'Complete 25 collaboration sessions', 'rocket', 'sessions_completed', 25, 4, 4, 'prime_ai', 'Quarter-century of sessions = you have earned priority access.', 'Direct Engineer Booking'),
('artist', 'Legend', 'Complete 50 collaboration sessions', 'trophy', 'sessions_completed', 50, 5, 5, 'prime_ai', 'Fifty sessions. You are not just using MixClub. You ARE MixClub.', 'Label Services VIP Discount');

-- Engineer Unlockables  
INSERT INTO public.unlockables (unlock_type, name, description, icon_name, metric_type, target_value, tier, sort_order, created_by, ai_reasoning, reward_description) VALUES
('engineer', 'First Delivery', 'Deliver your first project', 'check-circle', 'projects_delivered', 1, 1, 1, 'prime_ai', 'First delivery = skin in the game. You are on the board now.', 'Profile Visibility Boost'),
('engineer', 'Proven', 'Deliver 5 projects', 'briefcase', 'projects_delivered', 5, 2, 2, 'prime_ai', 'Five deliveries prove consistency. Artists notice that.', 'Premium Engineer Badge'),
('engineer', 'Professional', 'Deliver 10 projects', 'shield', 'projects_delivered', 10, 3, 3, 'prime_ai', 'Double digits = you are proven. Front page material.', 'Featured Engineer Placement'),
('engineer', 'Expert', 'Deliver 25 projects', 'target', 'projects_delivered', 25, 4, 4, 'prime_ai', 'You have earned first dibs on new sessions. Priority queue unlocked.', 'Priority Session Notifications'),
('engineer', 'Master', 'Deliver 50 projects', 'gem', 'projects_delivered', 50, 5, 5, 'prime_ai', 'Fifty projects. You are a master of your craft. Revenue share bonus tier.', 'Revenue Share Bonus Tier');

-- Enable realtime for unlockables
ALTER PUBLICATION supabase_realtime ADD TABLE public.unlockables;
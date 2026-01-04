-- =============================================
-- MixClub Profiles 2030: Brand Identity System
-- =============================================

-- 1. Extend profiles table with brand identity columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS pinned_track_id UUID,
ADD COLUMN IF NOT EXISTS status_emoji TEXT,
ADD COLUMN IF NOT EXISTS status_text TEXT,
ADD COLUMN IF NOT EXISTS is_available_for_collab BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0;

-- 2. Create user_follows table for social graph
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 3. Create user_activity table for activity feed
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create profile_views table for analytics
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'direct',
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Anyone can view follows"
ON public.user_follows FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can follow"
ON public.user_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.user_follows FOR DELETE
USING (auth.uid() = follower_id);

-- RLS Policies for user_activity
CREATE POLICY "Anyone can view public activity"
ON public.user_activity FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
ON public.user_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
ON public.user_activity FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity"
ON public.user_activity FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for profile_views
CREATE POLICY "Users can view their own profile views"
ON public.profile_views FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can log profile views"
ON public.profile_views FOR INSERT
WITH CHECK (true);

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the followed user
    UPDATE public.profiles 
    SET follower_count = COALESCE(follower_count, 0) + 1 
    WHERE id = NEW.following_id;
    
    -- Increment following count for the follower
    UPDATE public.profiles 
    SET following_count = COALESCE(following_count, 0) + 1 
    WHERE id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for the unfollowed user
    UPDATE public.profiles 
    SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0) 
    WHERE id = OLD.following_id;
    
    -- Decrement following count for the unfollower
    UPDATE public.profiles 
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) 
    WHERE id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for follow count updates
DROP TRIGGER IF EXISTS on_follow_change ON public.user_follows;
CREATE TRIGGER on_follow_change
AFTER INSERT OR DELETE ON public.user_follows
FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Function to increment profile view count
CREATE OR REPLACE FUNCTION public.increment_profile_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1 
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile view count
DROP TRIGGER IF EXISTS on_profile_view ON public.profile_views;
CREATE TRIGGER on_profile_view
AFTER INSERT ON public.profile_views
FOR EACH ROW EXECUTE FUNCTION public.increment_profile_views();

-- Enable realtime for activity and follows
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
-- Distribution referral tracking and release management tables

-- Track distribution partner referrals
CREATE TABLE IF NOT EXISTS public.distribution_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distributor_id TEXT NOT NULL,
  distributor_name TEXT NOT NULL,
  referral_code TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  signed_up BOOLEAN DEFAULT false,
  signed_up_at TIMESTAMP WITH TIME ZONE,
  commission_earned NUMERIC DEFAULT 0,
  commission_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Track user releases across distributors
CREATE TABLE IF NOT EXISTS public.music_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  distributor_id TEXT NOT NULL,
  distributor_name TEXT NOT NULL,
  release_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_type TEXT DEFAULT 'single',
  upc_code TEXT,
  isrc_codes JSONB DEFAULT '[]',
  release_date DATE,
  platforms JSONB DEFAULT '[]',
  artwork_url TEXT,
  status TEXT DEFAULT 'draft',
  spotify_url TEXT,
  apple_music_url TEXT,
  streaming_stats JSONB DEFAULT '{}',
  earnings_data JSONB DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Distribution analytics aggregation
CREATE TABLE IF NOT EXISTS public.distribution_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES public.music_releases(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  streams INTEGER DEFAULT 0,
  listeners INTEGER DEFAULT 0,
  earnings NUMERIC DEFAULT 0,
  saves INTEGER DEFAULT 0,
  playlist_adds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(release_id, date, platform)
);

-- Enable RLS
ALTER TABLE public.distribution_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for distribution_referrals
CREATE POLICY "Users can view their own referrals"
  ON public.distribution_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referrals"
  ON public.distribution_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all referrals"
  ON public.distribution_referrals FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update referrals"
  ON public.distribution_referrals FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for music_releases
CREATE POLICY "Users can view their own releases"
  ON public.music_releases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own releases"
  ON public.music_releases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own releases"
  ON public.music_releases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own releases"
  ON public.music_releases FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all releases"
  ON public.music_releases FOR SELECT
  USING (is_admin(auth.uid()));

-- RLS Policies for distribution_analytics
CREATE POLICY "Users can view their own analytics"
  ON public.distribution_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
  ON public.distribution_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
  ON public.distribution_analytics FOR SELECT
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_distribution_referrals_user ON public.distribution_referrals(user_id);
CREATE INDEX idx_distribution_referrals_distributor ON public.distribution_referrals(distributor_id);
CREATE INDEX idx_music_releases_user ON public.music_releases(user_id);
CREATE INDEX idx_music_releases_status ON public.music_releases(status);
CREATE INDEX idx_distribution_analytics_release ON public.distribution_analytics(release_id);
CREATE INDEX idx_distribution_analytics_date ON public.distribution_analytics(date);

-- Trigger to update music_releases updated_at
CREATE TRIGGER update_music_releases_updated_at
  BEFORE UPDATE ON public.music_releases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
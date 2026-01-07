-- =============================================
-- Phase A: Create Missing Database Tables
-- =============================================

-- 1. Session Packages Table
CREATE TABLE public.session_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  engineer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  package_status TEXT NOT NULL DEFAULT 'preparing' CHECK (package_status IN ('preparing', 'processing', 'ready', 'expired', 'failed')),
  daw_format TEXT,
  sample_rate INTEGER DEFAULT 44100,
  bit_depth INTEGER DEFAULT 24,
  package_url TEXT,
  stem_count INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Stem Organization Table
CREATE TABLE public.stem_organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_package_id UUID REFERENCES public.session_packages(id) ON DELETE CASCADE,
  audio_file_id UUID REFERENCES public.audio_files(id) ON DELETE CASCADE,
  stem_name TEXT NOT NULL,
  stem_type TEXT CHECK (stem_type IN ('vocal', 'drums', 'bass', 'guitar', 'keys', 'synth', 'fx', 'other')),
  color_code TEXT DEFAULT '#808080',
  track_order INTEGER DEFAULT 0,
  group_name TEXT,
  is_muted BOOLEAN DEFAULT false,
  is_solo BOOLEAN DEFAULT false,
  volume_db NUMERIC DEFAULT 0,
  pan NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Time Tracking Table
CREATE TABLE public.time_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE WHEN end_time IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60 
    ELSE NULL END
  ) STORED,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('mixing', 'mastering', 'recording', 'editing', 'collaboration', 'review', 'other')),
  notes TEXT,
  is_billable BOOLEAN DEFAULT true,
  hourly_rate NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Musical Profiles Table
CREATE TABLE public.musical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  primary_genre TEXT,
  secondary_genres TEXT[] DEFAULT '{}',
  influences TEXT[] DEFAULT '{}',
  instruments TEXT[] DEFAULT '{}',
  production_style TEXT,
  preferred_bpm_min INTEGER DEFAULT 60,
  preferred_bpm_max INTEGER DEFAULT 180,
  preferred_keys TEXT[] DEFAULT '{}',
  vocal_range TEXT,
  years_experience INTEGER,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Monthly Awards Table
CREATE TABLE public.monthly_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_month DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('top_engineer', 'most_projects', 'highest_rated', 'rising_star', 'community_champion', 'innovation')),
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  runner_up_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metrics JSONB DEFAULT '{}',
  prize_amount NUMERIC DEFAULT 0,
  announced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(award_month, category)
);

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_session_packages_project ON public.session_packages(project_id);
CREATE INDEX idx_session_packages_engineer ON public.session_packages(engineer_id);
CREATE INDEX idx_session_packages_artist ON public.session_packages(artist_id);
CREATE INDEX idx_session_packages_status ON public.session_packages(package_status);

CREATE INDEX idx_stem_organization_package ON public.stem_organization(session_package_id);
CREATE INDEX idx_stem_organization_audio ON public.stem_organization(audio_file_id);

CREATE INDEX idx_time_tracking_user ON public.time_tracking(user_id);
CREATE INDEX idx_time_tracking_project ON public.time_tracking(project_id);
CREATE INDEX idx_time_tracking_dates ON public.time_tracking(start_time, end_time);

CREATE INDEX idx_musical_profiles_user ON public.musical_profiles(user_id);
CREATE INDEX idx_musical_profiles_genre ON public.musical_profiles(primary_genre);

CREATE INDEX idx_monthly_awards_month ON public.monthly_awards(award_month);
CREATE INDEX idx_monthly_awards_winner ON public.monthly_awards(winner_id);

-- =============================================
-- Enable Row Level Security
-- =============================================

ALTER TABLE public.session_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stem_organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_awards ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Session Packages: Engineers and artists can view their own packages
CREATE POLICY "Users can view their session packages"
ON public.session_packages FOR SELECT
USING (auth.uid() = engineer_id OR auth.uid() = artist_id);

CREATE POLICY "Engineers can create session packages"
ON public.session_packages FOR INSERT
WITH CHECK (auth.uid() = engineer_id);

CREATE POLICY "Engineers can update their session packages"
ON public.session_packages FOR UPDATE
USING (auth.uid() = engineer_id);

-- Stem Organization: Users can manage stems for their packages
CREATE POLICY "Users can view stems for their packages"
ON public.stem_organization FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.session_packages sp 
    WHERE sp.id = session_package_id 
    AND (sp.engineer_id = auth.uid() OR sp.artist_id = auth.uid())
  )
);

CREATE POLICY "Users can manage stems for their packages"
ON public.stem_organization FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.session_packages sp 
    WHERE sp.id = session_package_id 
    AND sp.engineer_id = auth.uid()
  )
);

-- Time Tracking: Users can only see their own time entries
CREATE POLICY "Users can view their time entries"
ON public.time_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their time entries"
ON public.time_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their time entries"
ON public.time_tracking FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their time entries"
ON public.time_tracking FOR DELETE
USING (auth.uid() = user_id);

-- Musical Profiles: Public read, owner write
CREATE POLICY "Anyone can view musical profiles"
ON public.musical_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their musical profile"
ON public.musical_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their musical profile"
ON public.musical_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Monthly Awards: Public read, admin write (no direct user writes)
CREATE POLICY "Anyone can view monthly awards"
ON public.monthly_awards FOR SELECT
USING (true);

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE TRIGGER update_session_packages_updated_at
BEFORE UPDATE ON public.session_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_musical_profiles_updated_at
BEFORE UPDATE ON public.musical_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Enable Realtime for relevant tables
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.session_packages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_tracking;
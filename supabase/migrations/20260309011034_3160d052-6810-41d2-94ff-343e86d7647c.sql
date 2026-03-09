-- Create new tables only (premieres and session_comments already exist)

-- Engineer reviews
CREATE TABLE IF NOT EXISTS public.engineer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.engineer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view engineer reviews"
ON public.engineer_reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.engineer_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Review authors can update their own reviews"
ON public.engineer_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Review authors can delete their own reviews"
ON public.engineer_reviews FOR DELETE
TO authenticated
USING (auth.uid() = client_id);

-- Effect presets
CREATE TABLE IF NOT EXISTS public.effect_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  effect_type text NOT NULL,
  preset_name text NOT NULL,
  parameters jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.effect_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public presets are viewable by all"
ON public.effect_presets FOR SELECT
TO authenticated
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own presets"
ON public.effect_presets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets"
ON public.effect_presets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets"
ON public.effect_presets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Studio sessions
CREATE TABLE IF NOT EXISTS public.studio_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_name text NOT NULL,
  tracks jsonb NOT NULL,
  plugins jsonb,
  bpm integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.studio_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.studio_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.studio_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.studio_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.studio_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  notification_frequency text DEFAULT 'realtime' CHECK (notification_frequency IN ('realtime', 'daily', 'weekly')),
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'community')),
  show_email boolean DEFAULT false,
  show_location boolean DEFAULT true,
  show_earnings boolean DEFAULT false,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_engineer_reviews_engineer_id ON public.engineer_reviews(engineer_id);
CREATE INDEX IF NOT EXISTS idx_engineer_reviews_client_id ON public.engineer_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_effect_presets_user_id ON public.effect_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_effect_presets_effect_type ON public.effect_presets(effect_type);
CREATE INDEX IF NOT EXISTS idx_studio_sessions_user_id ON public.studio_sessions(user_id);
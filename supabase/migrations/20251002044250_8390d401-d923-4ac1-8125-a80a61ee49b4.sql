-- Tier 4: Pro Integrations & Advanced AI Audio Intelligence
-- API & Integration Framework Tables

-- Integration providers (DAW plugins, streaming platforms, etc.)
CREATE TABLE IF NOT EXISTS public.integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('daw_plugin', 'streaming', 'social_media', 'analytics', 'storage', 'ai_service', 'distribution')),
  provider_description TEXT,
  logo_url TEXT,
  documentation_url TEXT,
  api_version TEXT,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth', 'api_key', 'jwt', 'basic')),
  required_scopes TEXT[] DEFAULT '{}',
  webhook_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  setup_instructions JSONB DEFAULT '{}',
  rate_limits JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User integration connections
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.integration_providers(id) ON DELETE CASCADE NOT NULL,
  connection_status TEXT NOT NULL DEFAULT 'pending' CHECK (connection_status IN ('pending', 'active', 'expired', 'revoked', 'error')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connection_metadata JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'manual' CHECK (sync_frequency IN ('manual', 'hourly', 'daily', 'weekly', 'real_time')),
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Integration usage logs
CREATE TABLE IF NOT EXISTS public.integration_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_integration_id UUID REFERENCES public.user_integrations(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  action_metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  api_response JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Streaming platform connections
CREATE TABLE IF NOT EXISTS public.streaming_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform_name TEXT NOT NULL CHECK (platform_name IN ('spotify', 'apple_music', 'youtube_music', 'soundcloud', 'tidal', 'deezer', 'amazon_music')),
  artist_profile_id TEXT,
  artist_profile_url TEXT,
  verified BOOLEAN DEFAULT false,
  total_streams BIGINT DEFAULT 0,
  total_listeners INTEGER DEFAULT 0,
  top_tracks JSONB DEFAULT '[]',
  analytics_data JSONB DEFAULT '{}',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, platform_name)
);

-- Advanced AI Audio Intelligence Tables

-- AI audio analysis profiles
CREATE TABLE IF NOT EXISTS public.ai_audio_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  audio_file_id UUID REFERENCES public.audio_files(id) ON DELETE CASCADE NOT NULL,
  analysis_version TEXT NOT NULL DEFAULT 'v1',
  
  -- Spectral Analysis
  frequency_distribution JSONB DEFAULT '{}',
  harmonic_content JSONB DEFAULT '{}',
  spectral_centroid NUMERIC,
  spectral_rolloff NUMERIC,
  spectral_flux NUMERIC,
  
  -- Dynamic Analysis
  dynamic_range NUMERIC,
  loudness_lufs NUMERIC,
  peak_level NUMERIC,
  rms_level NUMERIC,
  crest_factor NUMERIC,
  
  -- Temporal Analysis
  tempo_bpm NUMERIC,
  time_signature TEXT,
  beat_grid JSONB DEFAULT '[]',
  rhythm_patterns JSONB DEFAULT '{}',
  
  -- Tonal Analysis
  key_signature TEXT,
  scale_type TEXT,
  chord_progression JSONB DEFAULT '[]',
  harmonic_complexity NUMERIC,
  
  -- Spatial Analysis
  stereo_width NUMERIC,
  phase_correlation NUMERIC,
  spatial_distribution JSONB DEFAULT '{}',
  
  -- Production Quality Metrics
  mastering_quality_score NUMERIC,
  mixing_balance_score NUMERIC,
  frequency_balance JSONB DEFAULT '{}',
  problem_frequencies JSONB DEFAULT '[]',
  
  -- AI-Generated Insights
  genre_prediction JSONB DEFAULT '{}',
  mood_analysis JSONB DEFAULT '{}',
  style_references JSONB DEFAULT '[]',
  improvement_suggestions JSONB DEFAULT '[]',
  
  -- Processing Info
  processing_time_ms INTEGER,
  ai_model_version TEXT,
  confidence_scores JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI mastering presets learned from user preferences
CREATE TABLE IF NOT EXISTS public.ai_mastering_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preset_name TEXT NOT NULL,
  genre_optimized TEXT,
  
  -- Learned parameters
  eq_curve JSONB NOT NULL,
  compression_settings JSONB NOT NULL,
  limiting_settings JSONB NOT NULL,
  stereo_enhancement JSONB DEFAULT '{}',
  saturation_settings JSONB DEFAULT '{}',
  
  -- Usage statistics
  times_used INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  user_rating NUMERIC,
  
  -- AI learning data
  training_samples INTEGER DEFAULT 0,
  model_confidence NUMERIC,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI-powered track recommendations for collaboration
CREATE TABLE IF NOT EXISTS public.ai_collaboration_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  engineer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Match scoring
  compatibility_score NUMERIC NOT NULL,
  genre_match_score NUMERIC,
  style_match_score NUMERIC,
  technical_match_score NUMERIC,
  
  -- Match reasoning
  match_factors JSONB DEFAULT '{}',
  shared_characteristics JSONB DEFAULT '[]',
  complementary_skills JSONB DEFAULT '[]',
  
  -- Engagement tracking
  viewed_by_artist BOOLEAN DEFAULT false,
  viewed_by_engineer BOOLEAN DEFAULT false,
  artist_interested BOOLEAN,
  engineer_interested BOOLEAN,
  
  match_status TEXT DEFAULT 'suggested' CHECK (match_status IN ('suggested', 'viewed', 'contacted', 'collaborated', 'dismissed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- API rate limiting and quotas
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_provider_id UUID REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  
  rate_limit_tier TEXT NOT NULL DEFAULT 'free' CHECK (rate_limit_tier IN ('free', 'pro', 'enterprise')),
  requests_per_hour INTEGER NOT NULL,
  requests_per_day INTEGER NOT NULL,
  
  current_hour_count INTEGER DEFAULT 0,
  current_day_count INTEGER DEFAULT 0,
  
  hour_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  day_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  is_throttled BOOLEAN DEFAULT false,
  throttle_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, integration_provider_id)
);

-- Enable RLS
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_mastering_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_collaboration_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using DO blocks to avoid conflicts)

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integration_providers' AND policyname = 'Everyone can view active integration providers') THEN
    CREATE POLICY "Everyone can view active integration providers"
      ON public.integration_providers FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integration_providers' AND policyname = 'Admins can manage integration providers') THEN
    CREATE POLICY "Admins can manage integration providers"
      ON public.integration_providers FOR ALL
      USING (is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_integrations' AND policyname = 'Users can view their own integrations') THEN
    CREATE POLICY "Users can view their own integrations"
      ON public.user_integrations FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_integrations' AND policyname = 'Users can manage their own integrations') THEN
    CREATE POLICY "Users can manage their own integrations"
      ON public.user_integrations FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integration_usage_logs' AND policyname = 'Users can view their own integration logs') THEN
    CREATE POLICY "Users can view their own integration logs"
      ON public.integration_usage_logs FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM user_integrations
        WHERE user_integrations.id = integration_usage_logs.user_integration_id
        AND user_integrations.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'streaming_connections' AND policyname = 'Users can manage their own streaming connections') THEN
    CREATE POLICY "Users can manage their own streaming connections"
      ON public.streaming_connections FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_audio_profiles' AND policyname = 'Users can view their own AI audio profiles') THEN
    CREATE POLICY "Users can view their own AI audio profiles"
      ON public.ai_audio_profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_audio_profiles' AND policyname = 'System can create AI audio profiles') THEN
    CREATE POLICY "System can create AI audio profiles"
      ON public.ai_audio_profiles FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_mastering_presets' AND policyname = 'Users can view their own presets') THEN
    CREATE POLICY "Users can view their own presets"
      ON public.ai_mastering_presets FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_mastering_presets' AND policyname = 'Users can view public presets') THEN
    CREATE POLICY "Users can view public presets"
      ON public.ai_mastering_presets FOR SELECT
      USING (is_public = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_mastering_presets' AND policyname = 'Users can manage their own presets') THEN
    CREATE POLICY "Users can manage their own presets"
      ON public.ai_mastering_presets FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_collaboration_matches' AND policyname = 'Artists can view their matches') THEN
    CREATE POLICY "Artists can view their matches"
      ON public.ai_collaboration_matches FOR SELECT
      USING (auth.uid() = artist_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_collaboration_matches' AND policyname = 'Engineers can view their matches') THEN
    CREATE POLICY "Engineers can view their matches"
      ON public.ai_collaboration_matches FOR SELECT
      USING (auth.uid() = engineer_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_collaboration_matches' AND policyname = 'Users can update their match status') THEN
    CREATE POLICY "Users can update their match status"
      ON public.ai_collaboration_matches FOR UPDATE
      USING (auth.uid() = artist_id OR auth.uid() = engineer_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_rate_limits' AND policyname = 'Users can view their own rate limits') THEN
    CREATE POLICY "Users can view their own rate limits"
      ON public.api_rate_limits FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_rate_limits' AND policyname = 'System can manage rate limits') THEN
    CREATE POLICY "System can manage rate limits"
      ON public.api_rate_limits FOR ALL
      USING (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_integrations_user ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON public.user_integrations(provider_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON public.integration_usage_logs(user_integration_id);
CREATE INDEX IF NOT EXISTS idx_streaming_connections_user ON public.streaming_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audio_profiles_user ON public.ai_audio_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audio_profiles_file ON public.ai_audio_profiles(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_ai_presets_user ON public.ai_mastering_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_matches_artist ON public.ai_collaboration_matches(artist_id);
CREATE INDEX IF NOT EXISTS idx_ai_matches_engineer ON public.ai_collaboration_matches(engineer_id);

-- Tier 4 milestone
INSERT INTO public.community_milestones (
  feature_key,
  milestone_name,
  milestone_description,
  milestone_type,
  target_value,
  current_value,
  display_order,
  icon_name,
  reward_description
) VALUES (
  'TIER_4_INTEGRATIONS_AI',
  'Tier 4: Pro Integrations',
  'Unlock DAW plugins, streaming platform integrations, and advanced AI audio intelligence',
  'user_count',
  1000,
  0,
  4,
  'plug',
  'API Framework, DAW Plugins, Streaming Analytics, Advanced AI Audio Analysis, Smart Mastering Presets'
) ON CONFLICT (feature_key) DO NOTHING;
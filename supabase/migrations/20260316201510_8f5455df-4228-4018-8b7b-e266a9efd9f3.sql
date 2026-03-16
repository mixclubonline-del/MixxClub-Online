
-- 1. User suspension columns on profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- 2. Content reports table
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports (for themselves)
CREATE POLICY "Users can create reports" ON public.content_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON public.content_reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON public.content_reports
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON public.content_reports
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Feature flags table
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone can read feature flags
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can update feature flags
CREATE POLICY "Admins can update feature flags" ON public.feature_flags
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert feature flags
CREATE POLICY "Admins can insert feature flags" ON public.feature_flags
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed feature flags from hardcoded defaults
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('REFERRAL_PROGRAM_ENABLED', true, 'Referral Program — Dual-sided incentives'),
  ('AI_SESSION_PREP_SHOWCASE', true, 'AI Session Prep Showcase — Highlight AI analysis'),
  ('COMMUNITY_MILESTONES_HOMEPAGE', true, 'Community Milestones on Homepage'),
  ('REMOTE_COLLABORATION_ENABLED', false, 'Remote Collaboration — Unlocks at 250 users'),
  ('MIX_BATTLES_ARENA_ENABLED', false, 'Mix Battles Arena — Unlocks at 100 users'),
  ('THE_LAB_ENABLED', false, 'The Lab — AI Hybrid DAW Studio'),
  ('EDUCATION_HUB_ENABLED', false, 'Educational Content Hub — Video tutorials, courses, certifications'),
  ('COLLABORATION_V2_ENABLED', false, 'Advanced Collaboration 2.0 — Voice commands, live AI suggestions'),
  ('MARKETPLACE_ENABLED', false, 'Marketplace Expansion — Sample libraries, presets, templates'),
  ('LABEL_SERVICES_ENABLED', false, 'Label Services Integration'),
  ('INTEGRATIONS_ENABLED', false, 'API & Integration Framework — DAW plugins, streaming platforms'),
  ('AI_AUDIO_INTELLIGENCE_ENABLED', false, 'Advanced AI Audio Intelligence'),
  ('DISTRIBUTION_WHITE_LABEL_ENABLED', true, 'Phase 2: White-Label Distribution Infrastructure'),
  ('DISTRIBUTION_ANALYTICS_ENABLED', false, 'Phase 3: Enhanced Analytics & Playlist Pitching'),
  ('DISTRIBUTION_PLAYLIST_PITCHING_ENABLED', false, 'Phase 3: Playlist Pitching'),
  ('DISTRIBUTION_REVENUE_SHARING_ENABLED', false, 'Phase 4: Revenue Sharing & Commission System')
ON CONFLICT (key) DO NOTHING;

-- 4. Audio moderation_status column
ALTER TABLE public.audio_files 
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'active';

-- Migrate existing flagged/hidden audio from waveform_data hack
UPDATE public.audio_files 
SET moderation_status = 'flagged' 
WHERE waveform_data::text LIKE '%"flagged":true%' AND moderation_status = 'active';

UPDATE public.audio_files 
SET moderation_status = 'hidden' 
WHERE waveform_data::text LIKE '%"hidden":true%' AND moderation_status = 'active';

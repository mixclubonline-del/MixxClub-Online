-- Add missing field to ai_audio_profiles
ALTER TABLE public.ai_audio_profiles
  ADD COLUMN tempo_bpm DECIMAL(6, 2);

-- Add missing field to ai_collaboration_matches
ALTER TABLE public.ai_collaboration_matches
  ADD COLUMN complementary_skills TEXT[];

-- Create battles table for arena hub
CREATE TABLE public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  battle_type TEXT DEFAULT 'freestyle',
  rapper1 TEXT,
  rapper2 TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view battles"
  ON public.battles FOR SELECT
  USING (true);

-- Add project relation to profiles
ALTER TABLE public.profiles
  ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
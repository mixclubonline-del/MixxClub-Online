-- Add project_id to payments for relationship
ALTER TABLE public.payments
  ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add missing fields to admin_security_events
ALTER TABLE public.admin_security_events
  ADD COLUMN admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN details JSONB,
  ADD COLUMN auto_action_taken BOOLEAN DEFAULT false;

-- Create ai_audio_profiles table
CREATE TABLE public.ai_audio_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_file_id UUID REFERENCES public.audio_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  genre_prediction TEXT,
  genre_confidence DECIMAL(3, 2),
  key_signature TEXT,
  bpm DECIMAL(6, 2),
  loudness_lufs DECIMAL(6, 2),
  dynamic_range DECIMAL(6, 2),
  spectral_centroid DECIMAL(10, 2),
  tempo_stability DECIMAL(3, 2),
  processing_time_ms INTEGER,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_audio_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audio profiles"
  ON public.ai_audio_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create audio profiles"
  ON public.ai_audio_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create get_security_dashboard_stats function
CREATE OR REPLACE FUNCTION public.get_security_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_events', (SELECT COUNT(*) FROM public.admin_security_events),
    'critical_events', (SELECT COUNT(*) FROM public.admin_security_events WHERE severity = 'critical' AND NOT is_resolved),
    'high_events', (SELECT COUNT(*) FROM public.admin_security_events WHERE severity = 'high' AND NOT is_resolved),
    'resolved_today', (SELECT COUNT(*) FROM public.admin_security_events WHERE DATE(resolved_at) = CURRENT_DATE),
    'failed_logins', (SELECT COUNT(*) FROM public.audit_logs WHERE action = 'login_failed' AND created_at > NOW() - INTERVAL '24 hours')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create indexes
CREATE INDEX idx_payments_project ON public.payments(project_id);
CREATE INDEX idx_ai_audio_profiles_file ON public.ai_audio_profiles(audio_file_id);
CREATE INDEX idx_ai_audio_profiles_user ON public.ai_audio_profiles(user_id);
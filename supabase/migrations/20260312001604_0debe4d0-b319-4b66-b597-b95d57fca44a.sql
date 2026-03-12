
-- Session templates table
CREATE TABLE public.session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'mixing',
  checklist JSONB NOT NULL DEFAULT '[]',
  default_settings JSONB NOT NULL DEFAULT '{}',
  icon TEXT DEFAULT 'music',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.session_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system templates"
  ON public.session_templates FOR SELECT
  USING (is_system = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create templates"
  ON public.session_templates FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND is_system = false);

CREATE POLICY "Users can update own templates"
  ON public.session_templates FOR UPDATE TO authenticated
  USING (created_by = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete own templates"
  ON public.session_templates FOR DELETE TO authenticated
  USING (created_by = auth.uid() AND is_system = false);

CREATE POLICY "Admins can manage all templates"
  ON public.session_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed system templates
INSERT INTO public.session_templates (name, description, session_type, icon, is_system, checklist, default_settings) VALUES
(
  'Vocal Recording',
  'Pre-configured setup for recording vocals with quality checks and monitoring.',
  'recording',
  'mic',
  true,
  '[{"id":"1","label":"Set up vocal mic and preamp","done":false},{"id":"2","label":"Check headphone mix levels","done":false},{"id":"3","label":"Record room tone (30s)","done":false},{"id":"4","label":"Test signal chain / gain staging","done":false},{"id":"5","label":"Record scratch take","done":false},{"id":"6","label":"Record final takes (3 minimum)","done":false},{"id":"7","label":"Comp best vocal takes","done":false},{"id":"8","label":"Export stems and session file","done":false}]',
  '{"audio_quality":"high","max_participants":3,"visibility":"private"}'
),
(
  'Mix Review',
  'Structured workflow for reviewing and approving a mix with the artist.',
  'mixing',
  'sliders-horizontal',
  true,
  '[{"id":"1","label":"Upload latest mix bounce","done":false},{"id":"2","label":"Listen through on monitors","done":false},{"id":"3","label":"Listen through on headphones","done":false},{"id":"4","label":"Check mono compatibility","done":false},{"id":"5","label":"Note revision requests with timestamps","done":false},{"id":"6","label":"Confirm vocal balance and clarity","done":false},{"id":"7","label":"Approve or request another pass","done":false}]',
  '{"audio_quality":"high","max_participants":4,"visibility":"private"}'
),
(
  'Mastering Approval',
  'Final QC and approval workflow before release.',
  'mastering',
  'check-circle',
  true,
  '[{"id":"1","label":"Upload mastered file + unmastered reference","done":false},{"id":"2","label":"A/B comparison with reference track","done":false},{"id":"3","label":"Check loudness (target LUFS)","done":false},{"id":"4","label":"Verify no clipping or distortion","done":false},{"id":"5","label":"Test on multiple playback systems","done":false},{"id":"6","label":"Confirm metadata and ISRC codes","done":false},{"id":"7","label":"Final sign-off and delivery","done":false}]',
  '{"audio_quality":"lossless","max_participants":3,"visibility":"private"}'
),
(
  'Beat Collab',
  'Open collaboration session for producers to cook beats together.',
  'production',
  'music',
  true,
  '[{"id":"1","label":"Share tempo and key","done":false},{"id":"2","label":"Establish vibe / reference tracks","done":false},{"id":"3","label":"Build drum pattern foundation","done":false},{"id":"4","label":"Layer melodic elements","done":false},{"id":"5","label":"Add bass and low end","done":false},{"id":"6","label":"Arrange structure (intro/verse/hook)","done":false},{"id":"7","label":"Export stems for each contributor","done":false}]',
  '{"audio_quality":"standard","max_participants":5,"visibility":"public"}'
);

-- Add engineer-deliverables bucket for premium content signed URLs
INSERT INTO storage.buckets (id, name, public)
VALUES ('engineer-deliverables', 'engineer-deliverables', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for engineer-deliverables bucket
CREATE POLICY "Engineers can upload deliverables"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'engineer-deliverables' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view deliverables shared with them"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'engineer-deliverables' AND auth.uid() IS NOT NULL);

CREATE POLICY "Engineers can delete own deliverables"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'engineer-deliverables' AND (storage.foldername(name))[1] = auth.uid()::text);

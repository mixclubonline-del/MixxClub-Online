-- Phase 2: MixxMaster Database Schema
-- Core MixxMaster Sessions Table
CREATE TABLE public.mixxmaster_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  manifest_data JSONB NOT NULL,
  format_version TEXT NOT NULL DEFAULT '1.0',
  storage_mode TEXT NOT NULL DEFAULT 'hybrid',
  checksum TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_legacy_migration BOOLEAN DEFAULT FALSE
);

-- Audio Stems within Sessions
CREATE TABLE public.mixxmaster_stems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.mixxmaster_sessions(id) ON DELETE CASCADE NOT NULL,
  stem_category TEXT NOT NULL CHECK (stem_category IN ('vocals', 'drums', 'instruments', 'fx')),
  stem_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  sample_rate INTEGER DEFAULT 48000,
  bit_depth INTEGER DEFAULT 24,
  channels INTEGER DEFAULT 2,
  waveform_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Version Control System
CREATE TABLE public.mixxmaster_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.mixxmaster_sessions(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  engineer_id UUID REFERENCES auth.users(id),
  engineer_signature TEXT,
  changes_summary TEXT,
  diff_data JSONB,
  manifest_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Metadata (PrimeBot Analysis)
CREATE TABLE public.mixxmaster_ai_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.mixxmaster_sessions(id) ON DELETE CASCADE NOT NULL,
  analysis_version TEXT NOT NULL DEFAULT 'primebot-4.0',
  spectral_analysis JSONB,
  tonal_analysis JSONB,
  emotion_analysis JSONB,
  mixing_suggestions JSONB[],
  plugin_recommendations JSONB,
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Plugin Chain Templates (for marketplace)
CREATE TABLE public.plugin_chain_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('vocal', 'drums', 'master', 'creative', 'other')),
  plugin_chain JSONB NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DAW Plugin Mapping (cross-compatibility)
CREATE TABLE public.daw_plugin_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_name TEXT NOT NULL,
  plugin_type TEXT NOT NULL,
  daw_platform TEXT NOT NULL CHECK (daw_platform IN ('logic', 'fl_studio', 'protools', 'studio_one')),
  native_plugin_id TEXT NOT NULL,
  parameter_mappings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plugin_name, plugin_type, daw_platform)
);

-- Enable RLS on all tables
ALTER TABLE public.mixxmaster_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixxmaster_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixxmaster_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixxmaster_ai_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_chain_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daw_plugin_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mixxmaster_sessions
CREATE POLICY "Users can view sessions for their projects"
  ON public.mixxmaster_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = mixxmaster_sessions.project_id
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Users can create sessions for their projects"
  ON public.mixxmaster_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = mixxmaster_sessions.project_id
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their project sessions"
  ON public.mixxmaster_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = mixxmaster_sessions.project_id
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    )
  );

-- RLS Policies for mixxmaster_stems
CREATE POLICY "Users can view stems for their sessions"
  ON public.mixxmaster_stems FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mixxmaster_sessions ms
      JOIN public.projects p ON ms.project_id = p.id
      WHERE ms.id = mixxmaster_stems.session_id
      AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "System can manage stems"
  ON public.mixxmaster_stems FOR ALL
  USING (true);

-- RLS Policies for mixxmaster_versions
CREATE POLICY "Users can view versions for their sessions"
  ON public.mixxmaster_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mixxmaster_sessions ms
      JOIN public.projects p ON ms.project_id = p.id
      WHERE ms.id = mixxmaster_versions.session_id
      AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Engineers can create versions"
  ON public.mixxmaster_versions FOR INSERT
  WITH CHECK (auth.uid() = engineer_id);

-- RLS Policies for mixxmaster_ai_metadata
CREATE POLICY "Users can view AI metadata for their sessions"
  ON public.mixxmaster_ai_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mixxmaster_sessions ms
      JOIN public.projects p ON ms.project_id = p.id
      WHERE ms.id = mixxmaster_ai_metadata.session_id
      AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "System can manage AI metadata"
  ON public.mixxmaster_ai_metadata FOR ALL
  USING (true);

-- RLS Policies for plugin_chain_templates
CREATE POLICY "Everyone can view public templates"
  ON public.plugin_chain_templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own templates"
  ON public.plugin_chain_templates FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can manage their own templates"
  ON public.plugin_chain_templates FOR ALL
  USING (auth.uid() = creator_id);

-- RLS Policies for daw_plugin_mappings
CREATE POLICY "Everyone can view DAW mappings"
  ON public.daw_plugin_mappings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage DAW mappings"
  ON public.daw_plugin_mappings FOR ALL
  USING (is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_mixxmaster_sessions_project ON public.mixxmaster_sessions(project_id);
CREATE INDEX idx_mixxmaster_stems_session ON public.mixxmaster_stems(session_id);
CREATE INDEX idx_mixxmaster_versions_session ON public.mixxmaster_versions(session_id);
CREATE INDEX idx_mixxmaster_ai_metadata_session ON public.mixxmaster_ai_metadata(session_id);
CREATE INDEX idx_plugin_templates_creator ON public.plugin_chain_templates(creator_id);
CREATE INDEX idx_plugin_templates_public ON public.plugin_chain_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_daw_mappings_lookup ON public.daw_plugin_mappings(plugin_name, plugin_type, daw_platform);

-- Function to automatically increment version number
CREATE OR REPLACE FUNCTION public.increment_mixxmaster_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM public.mixxmaster_versions WHERE session_id = NEW.session_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for version auto-increment
CREATE TRIGGER set_version_number
  BEFORE INSERT ON public.mixxmaster_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_mixxmaster_version();

-- Function to update mixxmaster_sessions.updated_at
CREATE OR REPLACE FUNCTION public.update_mixxmaster_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mixxmaster_sessions_updated_at
  BEFORE UPDATE ON public.mixxmaster_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mixxmaster_updated_at();
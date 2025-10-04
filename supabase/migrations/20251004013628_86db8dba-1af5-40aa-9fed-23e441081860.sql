-- Phase 1: Session Packages System

-- Create session packages table
CREATE TABLE public.session_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  package_status TEXT NOT NULL DEFAULT 'pending' CHECK (package_status IN ('pending', 'preparing', 'ready', 'downloaded', 'expired')),
  daw_format TEXT NOT NULL CHECK (daw_format IN ('pro_tools', 'logic', 'ableton', 'reaper', 'studio_one')),
  sample_rate INTEGER NOT NULL CHECK (sample_rate IN (44100, 48000, 96000)),
  bit_depth INTEGER NOT NULL CHECK (bit_depth IN (16, 24, 32)),
  package_url TEXT,
  file_size BIGINT,
  stem_count INTEGER DEFAULT 0,
  reference_tracks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ
);

-- Create stem organization table
CREATE TABLE public.stem_organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_package_id UUID NOT NULL REFERENCES public.session_packages(id) ON DELETE CASCADE,
  audio_file_id UUID NOT NULL REFERENCES public.audio_files(id) ON DELETE CASCADE,
  stem_name TEXT NOT NULL,
  stem_type TEXT CHECK (stem_type IN ('drums', 'bass', 'vocals', 'guitar', 'keys', 'synth', 'fx', 'other')),
  color_code TEXT,
  track_order INTEGER,
  group_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create engineer deliverables table
CREATE TABLE public.engineer_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  version_number INTEGER NOT NULL DEFAULT 1,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('rough_mix', 'final_mix', 'master', 'stems_package', 'revision')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'revision_requested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- Add columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS session_package_id UUID REFERENCES public.session_packages(id),
ADD COLUMN IF NOT EXISTS latest_deliverable_id UUID REFERENCES public.engineer_deliverables(id);

-- Add column to audio_files table
ALTER TABLE public.audio_files
ADD COLUMN IF NOT EXISTS stem_classification TEXT CHECK (stem_classification IN ('drums', 'bass', 'vocals', 'guitar', 'keys', 'synth', 'fx', 'other'));

-- Create indexes
CREATE INDEX idx_session_packages_project ON public.session_packages(project_id);
CREATE INDEX idx_session_packages_engineer ON public.session_packages(engineer_id);
CREATE INDEX idx_session_packages_status ON public.session_packages(package_status);
CREATE INDEX idx_stem_organization_package ON public.stem_organization(session_package_id);
CREATE INDEX idx_engineer_deliverables_project ON public.engineer_deliverables(project_id);
CREATE INDEX idx_engineer_deliverables_engineer ON public.engineer_deliverables(engineer_id);

-- RLS Policies for session_packages
ALTER TABLE public.session_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers can view their session packages"
ON public.session_packages FOR SELECT
TO authenticated
USING (auth.uid() = engineer_id);

CREATE POLICY "Artists can view their session packages"
ON public.session_packages FOR SELECT
TO authenticated
USING (auth.uid() = artist_id);

CREATE POLICY "Engineers can create session packages"
ON public.session_packages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = engineer_id);

CREATE POLICY "System can update session packages"
ON public.session_packages FOR UPDATE
TO authenticated
USING (auth.uid() = engineer_id OR auth.uid() = artist_id);

-- RLS Policies for stem_organization
ALTER TABLE public.stem_organization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stem organization for their packages"
ON public.stem_organization FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.session_packages sp
    WHERE sp.id = stem_organization.session_package_id
    AND (sp.engineer_id = auth.uid() OR sp.artist_id = auth.uid())
  )
);

CREATE POLICY "System can manage stem organization"
ON public.stem_organization FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.session_packages sp
    WHERE sp.id = stem_organization.session_package_id
    AND sp.engineer_id = auth.uid()
  )
);

-- RLS Policies for engineer_deliverables
ALTER TABLE public.engineer_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers can manage their deliverables"
ON public.engineer_deliverables FOR ALL
TO authenticated
USING (auth.uid() = engineer_id);

CREATE POLICY "Artists can view deliverables for their projects"
ON public.engineer_deliverables FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = engineer_deliverables.project_id
    AND p.client_id = auth.uid()
  )
);

CREATE POLICY "Artists can update deliverable status"
ON public.engineer_deliverables FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = engineer_deliverables.project_id
    AND p.client_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = engineer_deliverables.project_id
    AND p.client_id = auth.uid()
  )
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('session-packages', 'session-packages', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('engineer-deliverables', 'engineer-deliverables', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for session-packages
CREATE POLICY "Engineers can upload session packages"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'session-packages' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can download their session packages"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'session-packages' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR
   EXISTS (
     SELECT 1 FROM public.session_packages sp
     WHERE sp.package_url LIKE '%' || name
     AND (sp.engineer_id = auth.uid() OR sp.artist_id = auth.uid())
   ))
);

-- Storage policies for engineer-deliverables
CREATE POLICY "Engineers can upload deliverables"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'engineer-deliverables' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Project members can view deliverables"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'engineer-deliverables' AND
  EXISTS (
    SELECT 1 FROM public.engineer_deliverables ed
    JOIN public.projects p ON ed.project_id = p.id
    WHERE ed.file_path LIKE '%' || name
    AND (p.engineer_id = auth.uid() OR p.client_id = auth.uid())
  )
);
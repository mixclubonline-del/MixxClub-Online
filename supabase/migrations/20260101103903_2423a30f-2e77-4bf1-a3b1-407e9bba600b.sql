-- Extend collaborative_projects with new columns for full lifecycle management
ALTER TABLE public.collaborative_projects 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS deadline timestamp with time zone,
ADD COLUMN IF NOT EXISTS estimated_hours numeric,
ADD COLUMN IF NOT EXISTS actual_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.crm_clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS progress_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Create project_activities table for activity tracking
CREATE TABLE IF NOT EXISTS public.project_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project_comments table for threaded comments
CREATE TABLE IF NOT EXISTS public.project_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  parent_id uuid REFERENCES public.project_comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project_files table for file versioning
CREATE TABLE IF NOT EXISTS public.project_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  version integer DEFAULT 1,
  category text DEFAULT 'other',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_activities
CREATE POLICY "Partnership members can view project activities"
ON public.project_activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collaborative_projects cp
    JOIN partnerships p ON p.id = cp.partnership_id
    WHERE cp.id = project_activities.project_id 
    AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
  )
);

CREATE POLICY "Partnership members can create project activities"
ON public.project_activities FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM collaborative_projects cp
    JOIN partnerships p ON p.id = cp.partnership_id
    WHERE cp.id = project_activities.project_id 
    AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
  )
);

-- RLS policies for project_comments
CREATE POLICY "Partnership members can view project comments"
ON public.project_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collaborative_projects cp
    JOIN partnerships p ON p.id = cp.partnership_id
    WHERE cp.id = project_comments.project_id 
    AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
  )
);

CREATE POLICY "Partnership members can create project comments"
ON public.project_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM collaborative_projects cp
    JOIN partnerships p ON p.id = cp.partnership_id
    WHERE cp.id = project_comments.project_id 
    AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own comments"
ON public.project_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.project_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for project_files
CREATE POLICY "Partnership members can view project files"
ON public.project_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collaborative_projects cp
    JOIN partnerships p ON p.id = cp.partnership_id
    WHERE cp.id = project_files.project_id 
    AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
  )
);

CREATE POLICY "Partnership members can upload project files"
ON public.project_files FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM collaborative_projects cp
    JOIN partnerships p ON p.id = cp.partnership_id
    WHERE cp.id = project_files.project_id 
    AND (p.artist_id = auth.uid() OR p.engineer_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own files"
ON public.project_files FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_files;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON public.project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_projects_client_id ON public.collaborative_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_projects_deadline ON public.collaborative_projects(deadline);
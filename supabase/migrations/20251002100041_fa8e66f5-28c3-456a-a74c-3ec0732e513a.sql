-- Add project progress tracking
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD COLUMN IF NOT EXISTS estimated_completion_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS actual_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS time_tracked_minutes integer DEFAULT 0;

-- Create project templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  template_description text,
  service_type text NOT NULL,
  default_budget numeric,
  estimated_duration_days integer,
  checklist_items jsonb DEFAULT '[]'::jsonb,
  required_files jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates are viewable by everyone"
ON public.project_templates FOR SELECT
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create templates"
ON public.project_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their templates"
ON public.project_templates FOR UPDATE
USING (auth.uid() = created_by);

-- Create saved payment methods table
CREATE TABLE IF NOT EXISTS public.saved_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id text NOT NULL,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved payment methods"
ON public.saved_payment_methods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their saved payment methods"
ON public.saved_payment_methods FOR ALL
USING (auth.uid() = user_id);

-- Create saved jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved jobs"
ON public.saved_jobs FOR ALL
USING (auth.uid() = user_id);

-- Create job application templates table
CREATE TABLE IF NOT EXISTS public.application_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  cover_letter text,
  portfolio_links jsonb DEFAULT '[]'::jsonb,
  experience_summary text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.application_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their application templates"
ON public.application_templates FOR ALL
USING (auth.uid() = user_id);

-- Create time tracking entries table
CREATE TABLE IF NOT EXISTS public.time_tracking_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  duration_minutes integer,
  is_billable boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.time_tracking_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view time entries for their projects"
ON public.time_tracking_entries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = time_tracking_entries.project_id 
  AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
));

CREATE POLICY "Engineers can manage time entries for their projects"
ON public.time_tracking_entries FOR ALL
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = time_tracking_entries.project_id 
  AND projects.engineer_id = auth.uid()
));

-- Add trigger to update project time_tracked_minutes
CREATE OR REPLACE FUNCTION update_project_time_tracked()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE projects
    SET time_tracked_minutes = (
      SELECT COALESCE(SUM(duration_minutes), 0)
      FROM time_tracking_entries
      WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects
    SET time_tracked_minutes = (
      SELECT COALESCE(SUM(duration_minutes), 0)
      FROM time_tracking_entries
      WHERE project_id = OLD.project_id
    )
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_project_time_tracked_trigger
AFTER INSERT OR UPDATE OR DELETE ON time_tracking_entries
FOR EACH ROW EXECUTE FUNCTION update_project_time_tracked();
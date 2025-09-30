-- Create job postings table for artist-engineer matching
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  budget NUMERIC,
  deadline TIMESTAMP WITH TIME ZONE,
  service_type TEXT NOT NULL DEFAULT 'mixing', -- mixing, mastering, both
  status TEXT NOT NULL DEFAULT 'open', -- open, assigned, in_progress, completed, cancelled
  ai_analysis JSONB DEFAULT '{}',
  stems_prepared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_engineer_id UUID
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Artists can create job postings" 
ON public.job_postings 
FOR INSERT 
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can view their own postings" 
ON public.job_postings 
FOR SELECT 
USING (auth.uid() = artist_id);

CREATE POLICY "Engineers can view open job postings" 
ON public.job_postings 
FOR SELECT 
USING (status = 'open' OR auth.uid() = assigned_engineer_id);

CREATE POLICY "Engineers can update assigned jobs" 
ON public.job_postings 
FOR UPDATE 
USING (auth.uid() = assigned_engineer_id);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  engineer_id UUID NOT NULL,
  message TEXT,
  proposed_rate NUMERIC,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for applications
CREATE POLICY "Engineers can create applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = engineer_id);

CREATE POLICY "Engineers can view their applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = engineer_id);

CREATE POLICY "Artists can view applications for their jobs" 
ON public.job_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.job_postings 
  WHERE id = job_applications.job_id 
  AND artist_id = auth.uid()
));

CREATE POLICY "Artists can update applications for their jobs" 
ON public.job_applications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.job_postings 
  WHERE id = job_applications.job_id 
  AND artist_id = auth.uid()
));

-- Create file analysis results table
CREATE TABLE public.file_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_file_id UUID NOT NULL,
  job_id UUID,
  analysis_data JSONB NOT NULL DEFAULT '{}',
  stems_generated BOOLEAN DEFAULT false,
  stems_paths JSONB DEFAULT '[]',
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies for file analysis
CREATE POLICY "Users can view analysis for their files" 
ON public.file_analysis 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.audio_files af
  JOIN public.projects p ON af.project_id = p.id
  WHERE af.id = file_analysis.audio_file_id 
  AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
));

-- Add update trigger for job_postings
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add update trigger for file_analysis
CREATE TRIGGER update_file_analysis_updated_at
  BEFORE UPDATE ON public.file_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
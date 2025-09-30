-- Create table for tracking imported audio files in DAW sessions
CREATE TABLE IF NOT EXISTS public.daw_imported_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds REAL,
  sample_rate INTEGER,
  channels INTEGER DEFAULT 2,
  bit_depth INTEGER DEFAULT 16,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daw_imported_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daw_imported_files
CREATE POLICY "Users can view their own imported files" 
ON public.daw_imported_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imported files" 
ON public.daw_imported_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imported files" 
ON public.daw_imported_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imported files" 
ON public.daw_imported_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updating updated_at
CREATE TRIGGER update_daw_imported_files_updated_at
BEFORE UPDATE ON public.daw_imported_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
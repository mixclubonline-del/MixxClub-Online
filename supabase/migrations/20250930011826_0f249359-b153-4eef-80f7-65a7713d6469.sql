-- Add job_id column to audio_files table to support job postings
ALTER TABLE public.audio_files ADD COLUMN job_id uuid;

-- Add foreign key reference to job_postings
ALTER TABLE public.audio_files 
ADD CONSTRAINT fk_audio_files_job_id 
FOREIGN KEY (job_id) REFERENCES public.job_postings(id);

-- Update RLS policies to allow access to files through job_id
CREATE POLICY "Users can upload audio files to their job postings" 
ON public.audio_files 
FOR INSERT 
WITH CHECK (
  (auth.uid() = uploaded_by) AND 
  (
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = audio_files.project_id 
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    ))
    OR
    (job_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM job_postings 
      WHERE job_postings.id = audio_files.job_id 
      AND job_postings.artist_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can view audio files for their job postings" 
ON public.audio_files 
FOR SELECT 
USING (
  (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = audio_files.project_id 
    AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
  ))
  OR
  (EXISTS (
    SELECT 1 FROM job_postings 
    WHERE job_postings.id = audio_files.job_id 
    AND (job_postings.artist_id = auth.uid() OR job_postings.status = 'open')
  ))
);

-- Update storage policies for audio-files bucket to allow user-based paths
CREATE POLICY "Users can upload their own audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'audio-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view audio files for their jobs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'audio-files' AND 
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM audio_files af
      JOIN job_postings jp ON af.job_id = jp.id
      WHERE af.file_path = name AND jp.status = 'open'
    )
  )
);
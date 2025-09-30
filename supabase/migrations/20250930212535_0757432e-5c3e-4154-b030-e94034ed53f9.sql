-- Create showcase_audio_samples table for before/after audio demonstrations
CREATE TABLE IF NOT EXISTS public.showcase_audio_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  before_file_path TEXT NOT NULL,
  after_file_path TEXT NOT NULL,
  before_file_name TEXT NOT NULL,
  after_file_name TEXT NOT NULL,
  category TEXT DEFAULT 'mixing',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create media_library table for site images and assets
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  alt_text TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.showcase_audio_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for showcase_audio_samples
CREATE POLICY "Anyone can view showcase samples"
  ON public.showcase_audio_samples
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert showcase samples"
  ON public.showcase_audio_samples
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update showcase samples"
  ON public.showcase_audio_samples
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete showcase samples"
  ON public.showcase_audio_samples
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for media_library
CREATE POLICY "Anyone can view media library"
  ON public.media_library
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert media"
  ON public.media_library
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update media"
  ON public.media_library
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete media"
  ON public.media_library
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create storage buckets for admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('showcase-audio', 'showcase-audio', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('media-library', 'media-library', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for showcase-audio bucket
CREATE POLICY "Anyone can view showcase audio"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'showcase-audio');

CREATE POLICY "Admins can upload showcase audio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'showcase-audio' AND
    is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete showcase audio"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'showcase-audio' AND
    is_admin(auth.uid())
  );

-- Storage policies for media-library bucket
CREATE POLICY "Anyone can view media library"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media-library');

CREATE POLICY "Admins can upload to media library"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media-library' AND
    is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete from media library"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media-library' AND
    is_admin(auth.uid())
  );

-- Add update trigger
CREATE TRIGGER update_showcase_audio_samples_updated_at
  BEFORE UPDATE ON public.showcase_audio_samples
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON public.media_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
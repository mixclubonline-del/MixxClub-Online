-- Create exported_tracks table to track DAW exports
CREATE TABLE public.exported_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT,
  genre TEXT,
  bpm INTEGER,
  duration_seconds NUMERIC,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  format TEXT DEFAULT 'wav',
  bit_depth INTEGER DEFAULT 24,
  sample_rate INTEGER DEFAULT 48000,
  velvet_curve_preset TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  distributed_at TIMESTAMPTZ,
  distribution_partner TEXT
);

-- Enable RLS
ALTER TABLE public.exported_tracks ENABLE ROW LEVEL SECURITY;

-- Users can view their own exports
CREATE POLICY "Users can view own exports"
  ON public.exported_tracks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create exports
CREATE POLICY "Users can create exports"
  ON public.exported_tracks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own exports (for distribution status)
CREATE POLICY "Users can update own exports"
  ON public.exported_tracks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own exports
CREATE POLICY "Users can delete own exports"
  ON public.exported_tracks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for exported tracks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exported-tracks',
  'exported-tracks',
  false,
  104857600, -- 100MB limit
  ARRAY['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload to their own folder
CREATE POLICY "Users can upload exports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exported-tracks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can view their own exports
CREATE POLICY "Users can view own export files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exported-tracks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can delete their own exports
CREATE POLICY "Users can delete own export files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exported-tracks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
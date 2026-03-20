
-- Public bucket for page content images (hero backgrounds, section images, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-content-images', 'page-content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read (public bucket)
CREATE POLICY "Public read page content images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'page-content-images');

-- Admins can upload
CREATE POLICY "Admins can upload page content images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'page-content-images'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Admins can update
CREATE POLICY "Admins can update page content images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'page-content-images'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Admins can delete
CREATE POLICY "Admins can delete page content images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'page-content-images'
    AND public.has_role(auth.uid(), 'admin')
  );

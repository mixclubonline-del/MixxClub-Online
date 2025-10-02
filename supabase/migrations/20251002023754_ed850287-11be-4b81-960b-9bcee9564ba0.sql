-- Add Storage RLS policies for media-library bucket to allow admin uploads/updates/deletes
-- Using TO public to ensure correct role matching

DO $$
BEGIN
  -- INSERT policy for media-library
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' 
    AND policyname='Admins (public) can upload to media library'
  ) THEN
    CREATE POLICY "Admins (public) can upload to media library"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (
      bucket_id = 'media-library' AND public.is_admin(auth.uid())
    );
  END IF;

  -- UPDATE policy for media-library (needed for upsert)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' 
    AND policyname='Admins (public) can update media library'
  ) THEN
    CREATE POLICY "Admins (public) can update media library"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (
      bucket_id = 'media-library' AND public.is_admin(auth.uid())
    )
    WITH CHECK (
      bucket_id = 'media-library' AND public.is_admin(auth.uid())
    );
  END IF;

  -- DELETE policy for media-library
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' 
    AND policyname='Admins (public) can delete from media library'
  ) THEN
    CREATE POLICY "Admins (public) can delete from media library"
    ON storage.objects
    FOR DELETE
    TO public
    USING (
      bucket_id = 'media-library' AND public.is_admin(auth.uid())
    );
  END IF;
END$$;
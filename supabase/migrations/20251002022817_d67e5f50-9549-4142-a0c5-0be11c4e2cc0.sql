-- Add public-role variants of showcase-audio admin policies to ensure Storage uses correct role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins (public) can upload showcase audio'
  ) THEN
    CREATE POLICY "Admins (public) can upload showcase audio"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (
      bucket_id = 'showcase-audio' AND public.is_admin(auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins (public) can update showcase audio'
  ) THEN
    CREATE POLICY "Admins (public) can update showcase audio"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (
      bucket_id = 'showcase-audio' AND public.is_admin(auth.uid())
    )
    WITH CHECK (
      bucket_id = 'showcase-audio' AND public.is_admin(auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins (public) can delete showcase audio'
  ) THEN
    CREATE POLICY "Admins (public) can delete showcase audio"
    ON storage.objects
    FOR DELETE
    TO public
    USING (
      bucket_id = 'showcase-audio' AND public.is_admin(auth.uid())
    );
  END IF;
END$$;
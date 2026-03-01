CREATE POLICY "Allow anonymous read of demo beat"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audio-files'
  AND name = 'original_1772324337610_TEST MP3.mp3'
);
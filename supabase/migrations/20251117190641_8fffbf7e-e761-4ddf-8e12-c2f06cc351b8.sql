-- Create only missing tables that don't exist yet

-- Screen shares table
CREATE TABLE IF NOT EXISTS screen_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stream_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE screen_shares ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'screen_shares' 
    AND policyname = 'Session participants can view screen shares'
  ) THEN
    CREATE POLICY "Session participants can view screen shares" ON screen_shares 
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM session_participants 
        WHERE session_participants.session_id = screen_shares.session_id 
        AND session_participants.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Session recordings table
CREATE TABLE IF NOT EXISTS session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds NUMERIC,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'session_recordings' 
    AND policyname = 'Session participants can view recordings'
  ) THEN
    CREATE POLICY "Session participants can view recordings" ON session_recordings 
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM session_participants 
        WHERE session_participants.session_id = session_recordings.session_id 
        AND session_participants.user_id = auth.uid()
      ));
  END IF;
END $$;
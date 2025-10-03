-- Enhanced collaboration sessions with real-time state
ALTER TABLE collaboration_sessions ADD COLUMN IF NOT EXISTS session_state JSONB DEFAULT '{}'::jsonb;
ALTER TABLE collaboration_sessions ADD COLUMN IF NOT EXISTS current_playback_position REAL DEFAULT 0;
ALTER TABLE collaboration_sessions ADD COLUMN IF NOT EXISTS is_playing BOOLEAN DEFAULT false;

-- Inline audio comments with timestamps
CREATE TABLE IF NOT EXISTS audio_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp_seconds REAL NOT NULL,
  comment_text TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES audio_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for audio_comments
ALTER TABLE audio_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their sessions"
  ON audio_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaboration_sessions cs
      WHERE cs.id = audio_comments.session_id
      AND (cs.host_user_id = auth.uid() OR is_session_participant(cs.id, auth.uid()))
    )
  );

CREATE POLICY "Users can create comments in their sessions"
  ON audio_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM collaboration_sessions cs
      WHERE cs.id = audio_comments.session_id
      AND (cs.host_user_id = auth.uid() OR is_session_participant(cs.id, auth.uid()))
    )
  );

CREATE POLICY "Users can update their own comments"
  ON audio_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON audio_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Project version history
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  version_name TEXT,
  save_note TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  snapshot_data JSONB DEFAULT '{}'::jsonb,
  file_references JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for project_versions
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their projects"
  ON project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_versions.project_id
      AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Users can create versions for their projects"
  ON project_versions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_versions.project_id
      AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Cursor positions for real-time collaboration
CREATE TABLE IF NOT EXISTS session_cursor_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cursor_x REAL NOT NULL,
  cursor_y REAL NOT NULL,
  cursor_timestamp_seconds REAL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- RLS for cursor positions
ALTER TABLE session_cursor_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cursors in their sessions"
  ON session_cursor_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaboration_sessions cs
      WHERE cs.id = session_cursor_positions.session_id
      AND (cs.host_user_id = auth.uid() OR is_session_participant(cs.id, auth.uid()))
    )
  );

CREATE POLICY "Users can update their own cursor"
  ON session_cursor_positions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_comments_session ON audio_comments(session_id);
CREATE INDEX IF NOT EXISTS idx_audio_comments_audio_file ON audio_comments(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_audio_comments_timestamp ON audio_comments(timestamp_seconds);
CREATE INDEX IF NOT EXISTS idx_project_versions_project ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_cursor_positions_session ON session_cursor_positions(session_id);

-- Function to auto-increment version numbers
CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM project_versions WHERE project_id = NEW.project_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_version_number
  BEFORE INSERT ON project_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_version_number();
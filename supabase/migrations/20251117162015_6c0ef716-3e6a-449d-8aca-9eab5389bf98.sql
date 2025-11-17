-- Add missing field to achievements
ALTER TABLE public.achievements
  ADD COLUMN badge_name TEXT;

-- Add missing fields to ai_mixing_suggestions  
ALTER TABLE public.ai_mixing_suggestions
  ADD COLUMN applied BOOLEAN DEFAULT false,
  ADD COLUMN user_feedback TEXT;

-- Create collaboration_comments table
CREATE TABLE public.collaboration_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp_seconds DECIMAL(10, 2),
  comment_text TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.collaboration_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view comments"
  ON public.collaboration_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants
      WHERE session_id = collaboration_comments.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Session participants can create comments"
  ON public.collaboration_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.session_participants
      WHERE session_id = collaboration_comments.session_id AND user_id = auth.uid()
    )
  );

-- Create audio_streams table
CREATE TABLE public.audio_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stream_type TEXT DEFAULT 'audio',
  is_active BOOLEAN DEFAULT true,
  quality_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audio_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view streams"
  ON public.audio_streams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants
      WHERE session_id = audio_streams.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their streams"
  ON public.audio_streams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add missing fields to session_participants
ALTER TABLE public.session_participants
  ADD COLUMN is_active BOOLEAN DEFAULT true,
  ADD COLUMN audio_input_enabled BOOLEAN DEFAULT false,
  ADD COLUMN video_enabled BOOLEAN DEFAULT false,
  ADD COLUMN permissions JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX idx_collaboration_comments_session ON public.collaboration_comments(session_id);
CREATE INDEX idx_audio_streams_session ON public.audio_streams(session_id);
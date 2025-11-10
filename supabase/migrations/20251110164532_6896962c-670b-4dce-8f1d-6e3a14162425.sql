-- Add visibility column to collaboration_sessions
ALTER TABLE public.collaboration_sessions 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private'));

-- Create session_join_requests table
CREATE TABLE IF NOT EXISTS public.session_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(session_id, engineer_id)
);

-- Enable RLS
ALTER TABLE public.session_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_join_requests
CREATE POLICY "Engineers can view their own join requests"
  ON public.session_join_requests FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Artists can view join requests for their sessions"
  ON public.session_join_requests FOR SELECT
  USING (
    auth.uid() IN (
      SELECT host_user_id FROM public.collaboration_sessions 
      WHERE id = session_id
    )
  );

CREATE POLICY "Engineers can create join requests"
  ON public.session_join_requests FOR INSERT
  WITH CHECK (auth.uid() = engineer_id);

CREATE POLICY "Artists can update join requests for their sessions"
  ON public.session_join_requests FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT host_user_id FROM public.collaboration_sessions 
      WHERE id = session_id
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_session_join_requests_session_id 
  ON public.session_join_requests(session_id);
  
CREATE INDEX IF NOT EXISTS idx_session_join_requests_engineer_id 
  ON public.session_join_requests(engineer_id);

-- Add RLS policy for public sessions discovery
CREATE POLICY "Anyone can view public sessions"
  ON public.collaboration_sessions FOR SELECT
  USING (visibility = 'public' OR auth.uid() = host_user_id);
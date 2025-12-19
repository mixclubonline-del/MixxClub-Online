-- Add metadata column to session_comments for reactions, pins, and reply info
ALTER TABLE public.session_comments
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add is_pinned column for quick filtering
ALTER TABLE public.session_comments
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Create index for pinned messages
CREATE INDEX IF NOT EXISTS idx_session_comments_pinned ON public.session_comments(session_id, is_pinned) WHERE is_pinned = true;
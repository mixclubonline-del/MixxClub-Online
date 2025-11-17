-- Re-run idempotent structural changes and fix function signatures by dropping & recreating

-- 1) Columns additions (idempotent)
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS engineer_id uuid,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS estimated_delivery timestamp with time zone;

ALTER TABLE public.collaboration_sessions
  ADD COLUMN IF NOT EXISTS session_name text,
  ADD COLUMN IF NOT EXISTS session_type text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS client_id uuid,
  ADD COLUMN IF NOT EXISTS mixing_goals jsonb,
  ADD COLUMN IF NOT EXISTS special_instructions text;

ALTER TABLE public.collaboration_comments
  ADD COLUMN IF NOT EXISTS project_id uuid;

ALTER TABLE public.audio_streams
  ADD COLUMN IF NOT EXISTS stream_name text,
  ADD COLUMN IF NOT EXISTS volume numeric DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS is_muted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_solo boolean DEFAULT false;

-- 2) session_comments table + RLS
CREATE TABLE IF NOT EXISTS public.session_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment_text text NOT NULL,
  timestamp_seconds numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.session_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'session_comments' AND policyname = 'Session participants can create comments'
  ) THEN
    CREATE POLICY "Session participants can create comments"
    ON public.session_comments
    FOR INSERT
    WITH CHECK (
      (auth.uid() = user_id)
      AND EXISTS (
        SELECT 1 FROM public.session_participants sp
        WHERE sp.session_id = session_id AND sp.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'session_comments' AND policyname = 'Session participants can view comments'
  ) THEN
    CREATE POLICY "Session participants can view comments"
    ON public.session_comments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.session_participants sp
        WHERE sp.session_id = session_id AND sp.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 3) Drop zero-arg cleanup functions and recreate with configurable retention
DROP FUNCTION IF EXISTS public.cleanup_old_notifications();
DROP FUNCTION IF EXISTS public.cleanup_old_chatbot_messages();
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs();

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(days_to_keep integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - make_interval(days => days_to_keep)
    AND is_read = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_chatbot_messages(days_to_keep integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.chatbot_messages
  WHERE created_at < NOW() - make_interval(days => days_to_keep);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - make_interval(days => days_to_keep);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 4) Fix create_notification parameter names by dropping and recreating
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, text);

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_action_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$;

-- Fix security: Add search_path to functions
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, TEXT);
CREATE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Fix security: Update trigger functions with search_path
CREATE OR REPLACE FUNCTION notify_session_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inviter_name TEXT;
  session_title TEXT;
BEGIN
  SELECT COALESCE(full_name, email) INTO inviter_name
  FROM profiles
  WHERE id = NEW.inviter_id;
  
  SELECT title INTO session_title
  FROM collaboration_sessions
  WHERE id = NEW.session_id;
  
  IF NEW.engineer_id IS NOT NULL THEN
    PERFORM create_notification(
      NEW.engineer_id,
      'collaboration_invite',
      'Session Invitation',
      inviter_name || ' invited you to collaborate on "' || session_title || '"',
      '/session-invitations'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_session_join()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_name TEXT;
  session_title TEXT;
  host_id UUID;
BEGIN
  SELECT COALESCE(full_name, email) INTO participant_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  SELECT title, host_user_id INTO session_title, host_id
  FROM collaboration_sessions
  WHERE id = NEW.session_id;
  
  IF NEW.user_id != host_id THEN
    PERFORM create_notification(
      host_id,
      'collaboration_invite',
      'Participant Joined',
      participant_name || ' joined your session "' || session_title || '"',
      '/session/' || NEW.session_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;
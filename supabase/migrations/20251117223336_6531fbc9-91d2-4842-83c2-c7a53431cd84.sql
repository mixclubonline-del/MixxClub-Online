-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Drop and recreate function to create notification
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

-- Trigger function for session invitation notifications
CREATE OR REPLACE FUNCTION notify_session_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inviter_name TEXT;
  session_title TEXT;
BEGIN
  -- Get inviter name
  SELECT COALESCE(full_name, email) INTO inviter_name
  FROM profiles
  WHERE id = NEW.inviter_id;
  
  -- Get session title
  SELECT title INTO session_title
  FROM collaboration_sessions
  WHERE id = NEW.session_id;
  
  -- Create notification for invitee
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

-- Create trigger for session invitations
DROP TRIGGER IF EXISTS session_invitation_notification_trigger ON session_invitations;
CREATE TRIGGER session_invitation_notification_trigger
AFTER INSERT ON session_invitations
FOR EACH ROW
EXECUTE FUNCTION notify_session_invitation();

-- Trigger function for session participant join notifications
CREATE OR REPLACE FUNCTION notify_session_join()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  participant_name TEXT;
  session_title TEXT;
  host_id UUID;
BEGIN
  -- Get participant name
  SELECT COALESCE(full_name, email) INTO participant_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Get session info
  SELECT title, host_user_id INTO session_title, host_id
  FROM collaboration_sessions
  WHERE id = NEW.session_id;
  
  -- Notify host if participant is not the host
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

-- Create trigger for session participants
DROP TRIGGER IF EXISTS session_join_notification_trigger ON session_participants;
CREATE TRIGGER session_join_notification_trigger
AFTER INSERT ON session_participants
FOR EACH ROW
EXECUTE FUNCTION notify_session_join();
-- Just create the trigger function and trigger (realtime is already enabled)
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_follower_name TEXT;
  v_follower_username TEXT;
BEGIN
  -- Get follower info
  SELECT COALESCE(full_name, email), username
  INTO v_follower_name, v_follower_username
  FROM profiles
  WHERE id = NEW.follower_id;
  
  -- Create notification for the followed user
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    metadata
  ) VALUES (
    NEW.following_id,
    'follow',
    'New Follower',
    COALESCE('@' || v_follower_username, v_follower_name) || ' started following you',
    '/u/' || COALESCE(v_follower_username, NEW.follower_id::text),
    jsonb_build_object('follower_id', NEW.follower_id, 'follower_username', v_follower_username)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for follow notifications
DROP TRIGGER IF EXISTS trigger_follow_notification ON user_follows;
CREATE TRIGGER trigger_follow_notification
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION create_follow_notification();
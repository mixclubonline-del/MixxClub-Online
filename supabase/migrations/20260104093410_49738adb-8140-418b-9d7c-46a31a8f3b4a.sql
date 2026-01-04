-- Function to log follow activity
CREATE OR REPLACE FUNCTION public.log_follow_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_follower_username TEXT;
  v_following_username TEXT;
  v_follower_name TEXT;
  v_following_name TEXT;
BEGIN
  SELECT username, full_name INTO v_follower_username, v_follower_name FROM profiles WHERE id = NEW.follower_id;
  SELECT username, full_name INTO v_following_username, v_following_name FROM profiles WHERE id = NEW.following_id;
  
  INSERT INTO activity_feed (
    user_id,
    activity_type,
    title,
    description,
    is_public,
    metadata
  ) VALUES (
    NEW.follower_id,
    'collab',
    COALESCE('@' || v_follower_username, v_follower_name, 'Someone') || ' followed ' || COALESCE('@' || v_following_username, v_following_name, 'a user'),
    'New connection in the MixClub network',
    true,
    jsonb_build_object(
      'follower_id', NEW.follower_id,
      'following_id', NEW.following_id,
      'follower_username', v_follower_username,
      'following_username', v_following_username
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for follow activity
DROP TRIGGER IF EXISTS trigger_log_follow_activity ON user_follows;
CREATE TRIGGER trigger_log_follow_activity
  AFTER INSERT ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION log_follow_activity();

-- Function to log signup activity
CREATE OR REPLACE FUNCTION public.log_signup_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO activity_feed (
    user_id,
    activity_type,
    title,
    description,
    is_public,
    metadata
  ) VALUES (
    NEW.id,
    'signup',
    COALESCE('@' || NEW.username, NEW.full_name, 'A new artist') || ' joined MixClub',
    'Welcome to the community!',
    true,
    jsonb_build_object(
      'user_id', NEW.id,
      'username', NEW.username,
      'role', NEW.role
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for signup activity
DROP TRIGGER IF EXISTS trigger_log_signup_activity ON profiles;
CREATE TRIGGER trigger_log_signup_activity
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_signup_activity();
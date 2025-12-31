-- =============================================
-- PHASE 6: GAMIFICATION ACTIVATION
-- Database functions and triggers for XP/Points system
-- =============================================

-- Function to award points to a user
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_action_description TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_points INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current points and level
  SELECT COALESCE(points, 0), COALESCE(level, 1) 
  INTO v_new_points, v_old_level
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Add points
  v_new_points := v_new_points + p_points;
  
  -- Calculate new level (250 XP per level)
  v_new_level := GREATEST(1, (v_new_points / 250) + 1);
  
  -- Update profile
  UPDATE profiles 
  SET 
    points = v_new_points,
    level = v_new_level,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Check for level up achievement
  IF v_new_level > v_old_level THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_type)
    VALUES (
      p_user_id,
      'level_up',
      'Level ' || v_new_level || ' Reached!',
      'You''ve reached level ' || v_new_level || ' in the MIXXCLUB community.',
      'star',
      'milestone'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN v_new_points;
END;
$$;

-- Function to check and award milestone achievements
CREATE OR REPLACE FUNCTION public.check_milestone_achievements(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed_projects INTEGER;
  v_total_earnings NUMERIC;
  v_points INTEGER;
BEGIN
  -- Get user stats
  SELECT COALESCE(points, 0) INTO v_points FROM profiles WHERE id = p_user_id;
  
  -- Check for points milestones
  IF v_points >= 1000 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    VALUES (p_user_id, 'points_milestone', '1K Club', 'Earned your first 1,000 XP!', 'zap', 'XP Master', 'milestone')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_points >= 5000 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    VALUES (p_user_id, 'points_milestone', '5K Legend', 'Earned 5,000 XP! You''re a legend.', 'crown', 'XP Legend', 'legendary')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_points >= 10000 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    VALUES (p_user_id, 'points_milestone', '10K Elite', 'Earned 10,000 XP! Elite status unlocked.', 'gem', 'XP Elite', 'legendary')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Trigger function: Award XP when a project is created
CREATE OR REPLACE FUNCTION public.trigger_project_created_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award 50 XP for creating a project
  PERFORM award_points(NEW.user_id, 50, 'project_created', 'Created a new project');
  PERFORM check_milestone_achievements(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Trigger function: Award XP when project is completed
CREATE OR REPLACE FUNCTION public.trigger_project_completed_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Award 100 XP to project owner
    IF NEW.user_id IS NOT NULL THEN
      PERFORM award_points(NEW.user_id, 100, 'project_completed', 'Completed a project');
      PERFORM check_milestone_achievements(NEW.user_id);
    END IF;
    
    -- Award 150 XP to engineer (they did the work)
    IF NEW.engineer_id IS NOT NULL THEN
      PERFORM award_points(NEW.engineer_id, 150, 'project_delivered', 'Delivered a project');
      PERFORM check_milestone_achievements(NEW.engineer_id);
    END IF;
    
    -- Check for first project completion achievement
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT NEW.user_id, 'first_project', 'First Mix Complete!', 'Completed your first project on MIXXCLUB.', 'check-circle', 'Debut Drop', 'milestone'
    WHERE NOT EXISTS (
      SELECT 1 FROM achievements WHERE user_id = NEW.user_id AND achievement_type = 'first_project'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function: Award XP when audio file is uploaded
CREATE OR REPLACE FUNCTION public.trigger_audio_uploaded_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award 25 XP for uploading audio
  PERFORM award_points(NEW.user_id, 25, 'audio_uploaded', 'Uploaded an audio file');
  
  -- Check for first upload achievement
  INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
  SELECT NEW.user_id, 'first_upload', 'First Track Dropped!', 'Uploaded your first track to MIXXCLUB.', 'music', 'Beat Dropper', 'milestone'
  WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE user_id = NEW.user_id AND achievement_type = 'first_upload'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function: Award XP when session is created/hosted
CREATE OR REPLACE FUNCTION public.trigger_session_hosted_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award 30 XP for hosting a session
  PERFORM award_points(NEW.host_user_id, 30, 'session_hosted', 'Hosted a collaboration session');
  RETURN NEW;
END;
$$;

-- Trigger function: Award XP when joining a session
CREATE OR REPLACE FUNCTION public.trigger_session_joined_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Award 20 XP for joining a session
    PERFORM award_points(NEW.user_id, 20, 'session_joined', 'Joined a collaboration session');
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers (drop if exist first)
DROP TRIGGER IF EXISTS on_project_created_xp ON projects;
CREATE TRIGGER on_project_created_xp
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_project_created_xp();

DROP TRIGGER IF EXISTS on_project_completed_xp ON projects;
CREATE TRIGGER on_project_completed_xp
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_project_completed_xp();

DROP TRIGGER IF EXISTS on_audio_uploaded_xp ON audio_files;
CREATE TRIGGER on_audio_uploaded_xp
  AFTER INSERT ON audio_files
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audio_uploaded_xp();

DROP TRIGGER IF EXISTS on_session_hosted_xp ON collaboration_sessions;
CREATE TRIGGER on_session_hosted_xp
  AFTER INSERT ON collaboration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_session_hosted_xp();

DROP TRIGGER IF EXISTS on_session_joined_xp ON session_participants;
CREATE TRIGGER on_session_joined_xp
  AFTER UPDATE ON session_participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_session_joined_xp();

-- Add index for achievements lookup
CREATE INDEX IF NOT EXISTS idx_achievements_user_type ON achievements(user_id, achievement_type);
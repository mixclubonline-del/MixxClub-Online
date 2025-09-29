-- Fix security warnings: Add search_path to functions

CREATE OR REPLACE FUNCTION award_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_points INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE profiles
  SET points = points + points_to_add
  WHERE id = user_id
  RETURNING points INTO new_points;
  
  -- Level up logic (every 1000 points = 1 level)
  new_level := FLOOR(new_points / 1000) + 1;
  
  UPDATE profiles
  SET level = new_level
  WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION add_achievement(
  p_user_id UUID,
  p_badge_type TEXT,
  p_badge_name TEXT,
  p_badge_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_id UUID;
BEGIN
  INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
  VALUES (p_user_id, p_badge_type, p_badge_name, p_badge_description)
  RETURNING id INTO achievement_id;
  
  RETURN achievement_id;
END;
$$;
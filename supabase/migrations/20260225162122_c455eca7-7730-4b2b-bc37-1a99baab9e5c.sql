
-- 1. Make audio-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'audio-files';

-- 2. Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public audio files are viewable by everyone" ON storage.objects;

-- 3. Create owner-scoped read policy for audio files
CREATE POLICY "Users can view their own audio files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audio-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Harden update_engineer_leaderboard - admin only
CREATE OR REPLACE FUNCTION public.update_engineer_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  INSERT INTO engineer_leaderboard (engineer_id, total_earnings, completed_projects, average_rating, total_bonuses)
  SELECT 
    p.engineer_id,
    COALESCE(SUM(e.total_amount), 0) as total_earnings,
    COUNT(DISTINCT p.id) as completed_projects,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COALESCE(SUM(e.bonus_amount), 0) as total_bonuses
  FROM projects p
  LEFT JOIN engineer_earnings e ON p.id = e.project_id AND e.status = 'paid'
  LEFT JOIN project_reviews r ON p.id = r.project_id
  WHERE p.engineer_id IS NOT NULL
  GROUP BY p.engineer_id
  ON CONFLICT (engineer_id) 
  DO UPDATE SET
    total_earnings = EXCLUDED.total_earnings,
    completed_projects = EXCLUDED.completed_projects,
    average_rating = EXCLUDED.average_rating,
    total_bonuses = EXCLUDED.total_bonuses,
    updated_at = now();
  
  WITH ranked_engineers AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY total_earnings DESC, completed_projects DESC) as new_rank
    FROM engineer_leaderboard
  )
  UPDATE engineer_leaderboard
  SET rank = ranked_engineers.new_rank
  FROM ranked_engineers
  WHERE engineer_leaderboard.id = ranked_engineers.id;
END;
$$;

-- 5. Harden calculate_bonus_from_rating - admin only
CREATE OR REPLACE FUNCTION public.calculate_bonus_from_rating(
  p_project_id UUID,
  p_base_amount NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rating NUMERIC;
  v_bonus NUMERIC := 0;
BEGIN
  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT AVG(rating) INTO v_rating
  FROM project_reviews
  WHERE project_id = p_project_id;
  
  IF v_rating >= 4 THEN
    v_bonus := p_base_amount * 0.05 * (v_rating - 3);
  END IF;
  
  RETURN ROUND(v_bonus, 2);
END;
$$;

-- 6. Harden update_engineer_streak - admin only
CREATE OR REPLACE FUNCTION public.update_engineer_streak(p_engineer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT last_activity_date, current_streak
  INTO v_last_activity, v_current_streak
  FROM engineer_streaks
  WHERE engineer_id = p_engineer_id;
  
  IF NOT FOUND THEN
    INSERT INTO engineer_streaks (engineer_id, current_streak, longest_streak, last_activity_date, streak_start_date)
    VALUES (p_engineer_id, 1, 1, v_today, v_today);
  ELSIF v_last_activity = v_today THEN
    RETURN;
  ELSIF v_last_activity = v_today - 1 THEN
    UPDATE engineer_streaks
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = v_today,
      updated_at = now()
    WHERE engineer_id = p_engineer_id;
  ELSE
    UPDATE engineer_streaks
    SET 
      current_streak = 1,
      last_activity_date = v_today,
      streak_start_date = v_today,
      updated_at = now()
    WHERE engineer_id = p_engineer_id;
  END IF;
END;
$$;

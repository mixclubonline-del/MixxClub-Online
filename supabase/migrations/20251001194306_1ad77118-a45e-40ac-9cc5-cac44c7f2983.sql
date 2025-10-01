-- Enhanced Gamification System: Monthly Awards, Badge Criteria, Time-based Leaderboards

-- Monthly Awards Table
CREATE TABLE IF NOT EXISTS public.monthly_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  award_category TEXT NOT NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  award_value NUMERIC NOT NULL DEFAULT 0,
  award_description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(period_month, period_year, award_category, winner_id)
);

ALTER TABLE public.monthly_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view monthly awards"
  ON public.monthly_awards FOR SELECT
  USING (true);

CREATE POLICY "System can manage awards"
  ON public.monthly_awards FOR ALL
  USING (true);

-- Badge Criteria and Rarity System
CREATE TYPE public.badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

ALTER TABLE public.engineer_badges 
  ADD COLUMN IF NOT EXISTS badge_rarity badge_rarity DEFAULT 'common',
  ADD COLUMN IF NOT EXISTS criteria_met JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Achievement Progress Tracking
CREATE TABLE IF NOT EXISTS public.achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  progress_metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, achievement_type)
);

ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.achievement_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage progress"
  ON public.achievement_progress FOR ALL
  USING (true);

-- Enhanced Leaderboard with Time Periods
ALTER TABLE public.engineer_leaderboard
  ADD COLUMN IF NOT EXISTS leaderboard_type TEXT DEFAULT 'all_time',
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS period_end DATE;

-- Drop existing unique constraint if exists
ALTER TABLE public.engineer_leaderboard 
  DROP CONSTRAINT IF EXISTS engineer_leaderboard_engineer_id_key;

-- Add new composite unique constraint
ALTER TABLE public.engineer_leaderboard
  ADD CONSTRAINT engineer_leaderboard_unique_period 
  UNIQUE(engineer_id, period, leaderboard_type);

-- Function to automatically award badges based on criteria
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_engineer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_count INTEGER;
  v_avg_rating NUMERIC;
  v_total_earnings NUMERIC;
  v_current_streak INTEGER;
BEGIN
  -- Get engineer stats
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    AVG(pr.rating),
    COALESCE(SUM(ee.total_amount), 0),
    COALESCE(es.current_streak, 0)
  INTO v_project_count, v_avg_rating, v_total_earnings, v_current_streak
  FROM projects p
  LEFT JOIN project_reviews pr ON p.id = pr.project_id
  LEFT JOIN engineer_earnings ee ON p.id = ee.project_id
  LEFT JOIN engineer_streaks es ON es.engineer_id = p.engineer_id
  WHERE p.engineer_id = p_engineer_id
  GROUP BY es.current_streak;

  -- First Project Badge
  IF v_project_count >= 1 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'first_project'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'first_project', 'First Steps', 'Completed your first project', 'common');
  END IF;

  -- 10 Projects Badge
  IF v_project_count >= 10 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'projects_10'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'projects_10', 'Rising Star', 'Completed 10 projects', 'rare');
  END IF;

  -- 50 Projects Badge
  IF v_project_count >= 50 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'projects_50'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'projects_50', 'Veteran', 'Completed 50 projects', 'epic');
  END IF;

  -- 100 Projects Badge
  IF v_project_count >= 100 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'projects_100'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'projects_100', 'Master Engineer', 'Completed 100 projects', 'legendary');
  END IF;

  -- 5-Star Specialist Badge
  IF v_avg_rating >= 4.8 AND v_project_count >= 10 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'five_star'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'five_star', '5-Star Specialist', 'Maintained 4.8+ rating over 10 projects', 'epic');
  END IF;

  -- Week Streak Badge
  IF v_current_streak >= 7 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'streak_week'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'streak_week', 'Consistent Creator', '7-day activity streak', 'rare');
  END IF;

  -- Month Streak Badge
  IF v_current_streak >= 30 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'streak_month'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'streak_month', 'Dedication Master', '30-day activity streak', 'legendary');
  END IF;

  -- High Earner Badge
  IF v_total_earnings >= 10000 AND NOT EXISTS (
    SELECT 1 FROM engineer_badges 
    WHERE engineer_id = p_engineer_id AND badge_type = 'high_earner'
  ) THEN
    INSERT INTO engineer_badges (engineer_id, badge_type, badge_name, badge_description, badge_rarity)
    VALUES (p_engineer_id, 'high_earner', 'Top Earner', 'Earned over $10,000', 'epic');
  END IF;
END;
$$;

-- Trigger to check badges when project completes
CREATE OR REPLACE FUNCTION public.trigger_badge_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') 
     AND NEW.engineer_id IS NOT NULL THEN
    PERFORM check_and_award_badges(NEW.engineer_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_badges_on_completion ON public.projects;
CREATE TRIGGER check_badges_on_completion
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_badge_check();

-- Function to calculate monthly awards
CREATE OR REPLACE FUNCTION public.calculate_monthly_awards(p_month INTEGER, p_year INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_top_earner_id UUID;
  v_top_earner_amount NUMERIC;
  v_top_rated_id UUID;
  v_top_rated_rating NUMERIC;
  v_most_projects_id UUID;
  v_most_projects_count INTEGER;
BEGIN
  -- Top Earner Award
  SELECT engineer_id, SUM(total_amount)
  INTO v_top_earner_id, v_top_earner_amount
  FROM engineer_earnings
  WHERE EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year
    AND status = 'paid'
  GROUP BY engineer_id
  ORDER BY SUM(total_amount) DESC
  LIMIT 1;

  IF v_top_earner_id IS NOT NULL THEN
    INSERT INTO monthly_awards (period_month, period_year, award_category, winner_id, award_value, award_description)
    VALUES (p_month, p_year, 'top_earner', v_top_earner_id, v_top_earner_amount, 'Highest earnings this month')
    ON CONFLICT (period_month, period_year, award_category, winner_id) DO NOTHING;
  END IF;

  -- Top Rated Award
  SELECT engineer_id, AVG(rating)
  INTO v_top_rated_id, v_top_rated_rating
  FROM project_reviews
  WHERE EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year
  GROUP BY engineer_id
  HAVING COUNT(*) >= 3
  ORDER BY AVG(rating) DESC
  LIMIT 1;

  IF v_top_rated_id IS NOT NULL THEN
    INSERT INTO monthly_awards (period_month, period_year, award_category, winner_id, award_value, award_description)
    VALUES (p_month, p_year, 'top_rated', v_top_rated_id, v_top_rated_rating, 'Highest average rating this month')
    ON CONFLICT (period_month, period_year, award_category, winner_id) DO NOTHING;
  END IF;

  -- Most Projects Award
  SELECT engineer_id, COUNT(*)
  INTO v_most_projects_id, v_most_projects_count
  FROM projects
  WHERE EXTRACT(MONTH FROM updated_at) = p_month
    AND EXTRACT(YEAR FROM updated_at) = p_year
    AND status = 'completed'
  GROUP BY engineer_id
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  IF v_most_projects_id IS NOT NULL THEN
    INSERT INTO monthly_awards (period_month, period_year, award_category, winner_id, award_value, award_description)
    VALUES (p_month, p_year, 'most_projects', v_most_projects_id, v_most_projects_count, 'Most projects completed this month')
    ON CONFLICT (period_month, period_year, award_category, winner_id) DO NOTHING;
  END IF;
END;
$$;

-- Update achievement progress tracking
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  p_user_id UUID,
  p_achievement_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target INTEGER;
  v_current INTEGER;
BEGIN
  -- Define targets for different achievement types
  v_target := CASE p_achievement_type
    WHEN 'projects_completed' THEN 100
    WHEN 'perfect_ratings' THEN 10
    WHEN 'streak_days' THEN 30
    WHEN 'earnings_milestone' THEN 50000
    ELSE 10
  END;

  -- Insert or update progress
  INSERT INTO achievement_progress (user_id, achievement_type, current_progress, target_progress)
  VALUES (p_user_id, p_achievement_type, p_increment, v_target)
  ON CONFLICT (user_id, achievement_type)
  DO UPDATE SET
    current_progress = achievement_progress.current_progress + p_increment,
    updated_at = now(),
    completed_at = CASE
      WHEN achievement_progress.current_progress + p_increment >= v_target
      THEN now()
      ELSE achievement_progress.completed_at
    END;
END;
$$;
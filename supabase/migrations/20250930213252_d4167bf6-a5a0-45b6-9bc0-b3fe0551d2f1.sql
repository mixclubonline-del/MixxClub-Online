-- Create engineer_earnings table to track all earnings
CREATE TABLE IF NOT EXISTS public.engineer_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  base_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) GENERATED ALWAYS AS (base_amount + COALESCE(bonus_amount, 0)) STORED,
  status TEXT NOT NULL DEFAULT 'pending',
  payout_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT DEFAULT 'stripe',
  stripe_transfer_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT earnings_status_check CHECK (status IN ('pending', 'processing', 'paid', 'failed'))
);

-- Create engineer_badges table for gamification
CREATE TABLE IF NOT EXISTS public.engineer_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  icon_name TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(engineer_id, badge_type)
);

-- Create engineer_streaks table
CREATE TABLE IF NOT EXISTS public.engineer_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create engineer_leaderboard table (materialized view alternative)
CREATE TABLE IF NOT EXISTS public.engineer_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_bonuses NUMERIC(10,2) DEFAULT 0,
  rank INTEGER,
  period TEXT DEFAULT 'all_time',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id),
  payment_method TEXT DEFAULT 'stripe',
  stripe_transfer_id TEXT,
  notes TEXT,
  CONSTRAINT payout_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

-- Enable RLS
ALTER TABLE public.engineer_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engineer_earnings
CREATE POLICY "Engineers can view their own earnings"
  ON public.engineer_earnings FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Admins can view all earnings"
  ON public.engineer_earnings FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert earnings"
  ON public.engineer_earnings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update earnings"
  ON public.engineer_earnings FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for engineer_badges
CREATE POLICY "Engineers can view their own badges"
  ON public.engineer_badges FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Everyone can view all badges"
  ON public.engineer_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert badges"
  ON public.engineer_badges FOR INSERT
  WITH CHECK (true);

-- RLS Policies for engineer_streaks
CREATE POLICY "Engineers can view their own streaks"
  ON public.engineer_streaks FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Everyone can view all streaks"
  ON public.engineer_streaks FOR SELECT
  USING (true);

CREATE POLICY "System can manage streaks"
  ON public.engineer_streaks FOR ALL
  USING (true);

-- RLS Policies for engineer_leaderboard
CREATE POLICY "Everyone can view leaderboard"
  ON public.engineer_leaderboard FOR SELECT
  USING (true);

CREATE POLICY "System can update leaderboard"
  ON public.engineer_leaderboard FOR ALL
  USING (true);

-- RLS Policies for payout_requests
CREATE POLICY "Engineers can view their own payout requests"
  ON public.payout_requests FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Engineers can create payout requests"
  ON public.payout_requests FOR INSERT
  WITH CHECK (auth.uid() = engineer_id);

CREATE POLICY "Admins can view all payout requests"
  ON public.payout_requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update payout requests"
  ON public.payout_requests FOR UPDATE
  USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_engineer_earnings_updated_at
  BEFORE UPDATE ON public.engineer_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engineer_streaks_updated_at
  BEFORE UPDATE ON public.engineer_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engineer_leaderboard_updated_at
  BEFORE UPDATE ON public.engineer_leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION public.update_engineer_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update leaderboard stats
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
  
  -- Update ranks
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

-- Function to award bonus based on rating
CREATE OR REPLACE FUNCTION public.calculate_bonus_from_rating(
  p_project_id UUID,
  p_base_amount NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rating NUMERIC;
  v_bonus NUMERIC := 0;
BEGIN
  -- Get average rating for the project
  SELECT AVG(rating) INTO v_rating
  FROM project_reviews
  WHERE project_id = p_project_id;
  
  -- Calculate bonus: 5% for each star above 3
  IF v_rating >= 4 THEN
    v_bonus := p_base_amount * 0.05 * (v_rating - 3);
  END IF;
  
  RETURN ROUND(v_bonus, 2);
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_engineer_streak(p_engineer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get current streak data
  SELECT last_activity_date, current_streak
  INTO v_last_activity, v_current_streak
  FROM engineer_streaks
  WHERE engineer_id = p_engineer_id;
  
  IF NOT FOUND THEN
    -- Initialize streak
    INSERT INTO engineer_streaks (engineer_id, current_streak, longest_streak, last_activity_date, streak_start_date)
    VALUES (p_engineer_id, 1, 1, v_today, v_today);
  ELSIF v_last_activity = v_today THEN
    -- Already counted today
    RETURN;
  ELSIF v_last_activity = v_today - 1 THEN
    -- Continue streak
    UPDATE engineer_streaks
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = v_today,
      updated_at = now()
    WHERE engineer_id = p_engineer_id;
  ELSE
    -- Streak broken, start new
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
-- Add streak tracking columns to fan_stats
ALTER TABLE public.fan_stats 
ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now();

-- Create function to update streak on activity
CREATE OR REPLACE FUNCTION public.update_fan_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_hours_since_activity NUMERIC;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Calculate hours since last activity
  IF NEW.last_activity_at IS NOT NULL THEN
    v_hours_since_activity := EXTRACT(EPOCH FROM (now() - NEW.last_activity_at)) / 3600;
  ELSE
    v_hours_since_activity := 999;
  END IF;
  
  -- Get current streak values
  v_current_streak := COALESCE(NEW.engagement_streak, 0);
  v_longest_streak := COALESCE(NEW.longest_streak, 0);
  
  -- If activity within 36 hours (grace period), increment streak
  IF v_hours_since_activity <= 36 THEN
    -- Streak continues - increment if this is a new day's activity
    IF DATE(NEW.last_activity_at) < DATE(now()) THEN
      NEW.engagement_streak := v_current_streak + 1;
    END IF;
  ELSE
    -- Streak broken - reset to 1 for today's activity
    NEW.engagement_streak := 1;
  END IF;
  
  -- Update longest streak if current exceeds it
  IF NEW.engagement_streak > v_longest_streak THEN
    NEW.longest_streak := NEW.engagement_streak;
  END IF;
  
  -- Update last activity timestamp
  NEW.last_activity_at := now();
  
  RETURN NEW;
END;
$$;

-- Create trigger for streak updates (fires on any fan_stats update)
DROP TRIGGER IF EXISTS trigger_fan_streak_update ON public.fan_stats;
CREATE TRIGGER trigger_fan_streak_update
  BEFORE UPDATE OF total_votes, total_comments, total_shares, mixxcoinz_earned
  ON public.fan_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fan_streak();
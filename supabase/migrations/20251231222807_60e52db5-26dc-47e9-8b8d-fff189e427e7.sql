-- ================================================
-- PHASE 6: GAMIFICATION ACTIVATION
-- Seeds achievement definitions and enhances XP triggers
-- ================================================

-- First, let's check if profiles has the columns we need, add if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_xp') THEN
    ALTER TABLE public.profiles ADD COLUMN total_xp INTEGER DEFAULT 0;
  END IF;
END$$;

-- ================================================
-- PART 1: SEED ACHIEVEMENT DEFINITIONS
-- These are template achievements that users can unlock
-- ================================================

-- Create achievement_definitions table for predefined achievements
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_type TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'trophy',
  badge_name TEXT,
  badge_type TEXT DEFAULT 'milestone',
  category TEXT DEFAULT 'general',
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

-- Everyone can view achievement definitions
DROP POLICY IF EXISTS "Everyone can view achievement definitions" ON public.achievement_definitions;
CREATE POLICY "Everyone can view achievement definitions"
ON public.achievement_definitions FOR SELECT
USING (true);

-- Admins can manage achievement definitions
DROP POLICY IF EXISTS "Admins can manage achievement definitions" ON public.achievement_definitions;
CREATE POLICY "Admins can manage achievement definitions"
ON public.achievement_definitions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed the achievement definitions
INSERT INTO public.achievement_definitions (achievement_type, title, description, icon, badge_name, badge_type, category, xp_reward, criteria, sort_order) VALUES
-- First Steps Category
('first_upload', 'First Track Dropped', 'Upload your first audio track to MIXXCLUB', 'music', 'Beat Dropper', 'milestone', 'first_steps', 50, '{"action": "audio_upload", "count": 1}', 1),
('first_project', 'Project Pioneer', 'Create your first project', 'folder', 'Pioneer', 'milestone', 'first_steps', 75, '{"action": "project_create", "count": 1}', 2),
('first_collaboration', 'Team Player', 'Complete your first collaboration session', 'users', 'Collaborator', 'milestone', 'first_steps', 100, '{"action": "session_complete", "count": 1}', 3),
('first_review', 'Voice Heard', 'Leave your first review', 'star', 'Critic', 'milestone', 'first_steps', 25, '{"action": "review_given", "count": 1}', 4),
('first_payment', 'First Bag', 'Receive your first payment', 'dollar-sign', 'Paid', 'milestone', 'first_steps', 100, '{"action": "payment_received", "count": 1}', 5),

-- Consistency Category (Streaks)
('streak_7', 'Week Warrior', 'Maintain a 7-day activity streak', 'flame', 'On Fire', 'streak', 'consistency', 100, '{"streak_days": 7}', 10),
('streak_30', 'Monthly Grinder', 'Maintain a 30-day activity streak', 'flame', 'Dedicated', 'streak', 'consistency', 300, '{"streak_days": 30}', 11),
('streak_100', 'Century Legend', 'Maintain a 100-day activity streak', 'flame', 'Legendary', 'legendary', 'consistency', 1000, '{"streak_days": 100}', 12),

-- Collaboration Category
('sessions_5', 'Session Starter', 'Complete 5 collaboration sessions', 'headphones', 'Active', 'social', 'collaboration', 150, '{"action": "session_complete", "count": 5}', 20),
('sessions_25', 'Session Pro', 'Complete 25 collaboration sessions', 'headphones', 'Pro', 'social', 'collaboration', 400, '{"action": "session_complete", "count": 25}', 21),
('sessions_100', 'Session Master', 'Complete 100 collaboration sessions', 'headphones', 'Master', 'legendary', 'collaboration', 1000, '{"action": "session_complete", "count": 100}', 22),

-- Quality Category
('five_star', 'Perfect Score', 'Receive your first 5-star review', 'star', '5-Star', 'quality', 'quality', 100, '{"rating": 5}', 30),
('ten_five_stars', 'Crowd Favorite', 'Receive 10 five-star reviews', 'stars', 'Fan Favorite', 'quality', 'quality', 500, '{"rating": 5, "count": 10}', 31),
('avg_rating_45', 'Quality Assured', 'Maintain an average rating above 4.5', 'award', 'Trusted', 'quality', 'quality', 300, '{"avg_rating": 4.5}', 32),

-- Earnings Category
('earnings_100', 'First Hundred', 'Earn $100 on the platform', 'banknote', 'Earner', 'milestone', 'earnings', 100, '{"earnings": 100}', 40),
('earnings_1000', 'Thousand Club', 'Earn $1,000 on the platform', 'banknote', '1K Club', 'milestone', 'earnings', 300, '{"earnings": 1000}', 41),
('earnings_10000', 'Big Money', 'Earn $10,000 on the platform', 'gem', '10K Elite', 'legendary', 'earnings', 1000, '{"earnings": 10000}', 42),

-- Community Category
('first_referral', 'Ambassador', 'Refer your first user to MIXXCLUB', 'share-2', 'Referrer', 'social', 'community', 100, '{"action": "referral", "count": 1}', 50),
('referrals_10', 'Network Builder', 'Refer 10 users to MIXXCLUB', 'network', 'Networker', 'social', 'community', 500, '{"action": "referral", "count": 10}', 51),
('community_helper', 'Helping Hand', 'Help 5 users in the community', 'heart', 'Helper', 'social', 'community', 200, '{"action": "help_given", "count": 5}', 52),

-- XP Milestones
('xp_1000', '1K Club', 'Earn 1,000 XP', 'zap', 'XP Hunter', 'milestone', 'xp', 0, '{"xp": 1000}', 60),
('xp_5000', '5K Legend', 'Earn 5,000 XP', 'zap', 'XP Legend', 'milestone', 'xp', 0, '{"xp": 5000}', 61),
('xp_10000', '10K Elite', 'Earn 10,000 XP', 'crown', 'XP Master', 'legendary', 'xp', 0, '{"xp": 10000}', 62),

-- Level Milestones
('level_5', 'Rising Star', 'Reach level 5', 'trending-up', 'Rising', 'milestone', 'level', 0, '{"level": 5}', 70),
('level_10', 'Veteran', 'Reach level 10', 'award', 'Veteran', 'milestone', 'level', 0, '{"level": 10}', 71),
('level_25', 'Elite', 'Reach level 25', 'crown', 'Elite', 'legendary', 'level', 0, '{"level": 25}', 72)

ON CONFLICT (achievement_type) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  badge_name = EXCLUDED.badge_name,
  badge_type = EXCLUDED.badge_type,
  category = EXCLUDED.category,
  xp_reward = EXCLUDED.xp_reward,
  criteria = EXCLUDED.criteria,
  sort_order = EXCLUDED.sort_order;

-- ================================================
-- PART 2: ACHIEVEMENT CHECK FUNCTION (Simplified)
-- ================================================

CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_awarded_count INTEGER := 0;
  v_session_count INTEGER;
  v_upload_count INTEGER;
  v_review_count INTEGER;
  v_total_earnings NUMERIC;
  v_referral_count INTEGER;
  v_five_star_count INTEGER;
  v_current_level INTEGER;
BEGIN
  -- Get user stats
  SELECT COALESCE(level, 1) INTO v_current_level FROM profiles WHERE id = p_user_id;

  -- Count completed sessions
  SELECT COUNT(*) INTO v_session_count
  FROM session_participants sp
  JOIN collaboration_sessions cs ON cs.id = sp.session_id
  WHERE sp.user_id = p_user_id AND cs.status = 'completed';

  -- Count uploads
  SELECT COUNT(*) INTO v_upload_count
  FROM audio_files WHERE user_id = p_user_id;

  -- Count reviews given
  SELECT COUNT(*) INTO v_review_count
  FROM reviews WHERE reviewer_id = p_user_id;

  -- Get total earnings
  SELECT COALESCE(SUM(amount), 0) INTO v_total_earnings
  FROM engineer_earnings WHERE engineer_id = p_user_id AND status = 'paid';

  -- Count referrals
  SELECT COUNT(*) INTO v_referral_count
  FROM referrals WHERE referrer_id = p_user_id AND status = 'completed';

  -- Get 5-star reviews received
  SELECT COUNT(*) INTO v_five_star_count
  FROM reviews WHERE reviewed_id = p_user_id AND rating = 5;

  -- Check and award first upload
  IF v_upload_count >= 1 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'first_upload', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'first_upload'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'first_upload')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check session achievements
  IF v_session_count >= 1 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'first_collaboration', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'first_collaboration'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'first_collaboration')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_session_count >= 5 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'sessions_5', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'sessions_5'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'sessions_5')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check review achievement
  IF v_review_count >= 1 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'first_review', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'first_review'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'first_review')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check 5-star achievement
  IF v_five_star_count >= 1 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'five_star', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'five_star'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'five_star')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check earnings achievements
  IF v_total_earnings >= 100 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'earnings_100', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'earnings_100'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'earnings_100')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check referral achievements
  IF v_referral_count >= 1 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'first_referral', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'first_referral'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'first_referral')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check level achievements
  IF v_current_level >= 5 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
    SELECT p_user_id, 'level_5', ad.title, ad.description, ad.icon, ad.badge_name, ad.badge_type
    FROM achievement_definitions ad WHERE ad.achievement_type = 'level_5'
    AND NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'level_5')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_awarded_count;
END;
$$;

-- ================================================
-- PART 3: ENHANCED TRIGGERS FOR AUTOMATIC XP
-- ================================================

-- Trigger for review given (award XP to reviewer)
CREATE OR REPLACE FUNCTION public.trigger_review_given_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award 25 XP to reviewer
  PERFORM award_points(NEW.reviewer_id, 25, 'review_given', 'Review given');
  
  -- Award bonus XP to reviewed user for 5-star review
  IF NEW.rating = 5 THEN
    PERFORM award_points(NEW.reviewed_id, 100, 'five_star_received', '5-star review received');
  ELSIF NEW.rating >= 4 THEN
    PERFORM award_points(NEW.reviewed_id, 50, 'great_review', 'Great review received');
  END IF;
  
  -- Check achievements for both users
  PERFORM check_and_award_achievements(NEW.reviewer_id);
  PERFORM check_and_award_achievements(NEW.reviewed_id);
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_review_given_xp ON public.reviews;
CREATE TRIGGER trigger_review_given_xp
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.trigger_review_given_xp();

-- Trigger for session completion
CREATE OR REPLACE FUNCTION public.trigger_session_completed_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Award XP to host
    PERFORM award_points(NEW.host_user_id, 100, 'session_completed', 'Session completed as host');
    
    -- Check achievements for host
    PERFORM check_and_award_achievements(NEW.host_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_session_completed_xp ON public.collaboration_sessions;
CREATE TRIGGER trigger_session_completed_xp
AFTER UPDATE ON public.collaboration_sessions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_session_completed_xp();

-- Add index for faster achievement queries
CREATE INDEX IF NOT EXISTS idx_achievements_user_type ON public.achievements(user_id, achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_type ON public.achievement_definitions(achievement_type);

-- Enable realtime for achievements
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;
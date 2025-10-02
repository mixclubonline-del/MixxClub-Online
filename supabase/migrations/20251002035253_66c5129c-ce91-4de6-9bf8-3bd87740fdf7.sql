-- =====================================================
-- PHASE 1: Community Milestone Tracking System
-- =====================================================

-- Create community_milestones table
CREATE TABLE IF NOT EXISTS public.community_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  milestone_name TEXT NOT NULL,
  milestone_description TEXT,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('user_count', 'project_count', 'battle_count', 'custom')),
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  icon_name TEXT,
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create milestone_progress_log table
CREATE TABLE IF NOT EXISTS public.milestone_progress_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.community_milestones(id) ON DELETE CASCADE,
  previous_value INTEGER NOT NULL,
  new_value INTEGER NOT NULL,
  increment_amount INTEGER NOT NULL,
  reason TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create milestone_contributors table
CREATE TABLE IF NOT EXISTS public.milestone_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.community_milestones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_count INTEGER NOT NULL DEFAULT 1,
  first_contribution_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_contribution_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(milestone_id, user_id)
);

-- Enable RLS on milestone tables
ALTER TABLE public.community_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_progress_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_contributors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view milestones" ON public.community_milestones;
DROP POLICY IF EXISTS "Admins can manage milestones" ON public.community_milestones;
DROP POLICY IF EXISTS "Everyone can view progress log" ON public.milestone_progress_log;
DROP POLICY IF EXISTS "System can insert progress log" ON public.milestone_progress_log;
DROP POLICY IF EXISTS "Everyone can view contributors" ON public.milestone_contributors;
DROP POLICY IF EXISTS "System can manage contributors" ON public.milestone_contributors;

-- RLS Policies for community_milestones
CREATE POLICY "Everyone can view milestones"
  ON public.community_milestones FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage milestones"
  ON public.community_milestones FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for milestone_progress_log
CREATE POLICY "Everyone can view progress log"
  ON public.milestone_progress_log FOR SELECT
  USING (true);

CREATE POLICY "System can insert progress log"
  ON public.milestone_progress_log FOR INSERT
  WITH CHECK (true);

-- RLS Policies for milestone_contributors
CREATE POLICY "Everyone can view contributors"
  ON public.milestone_contributors FOR SELECT
  USING (true);

CREATE POLICY "System can manage contributors"
  ON public.milestone_contributors FOR ALL
  USING (true);

-- =====================================================
-- Update battles table for Mix/Song battles
-- =====================================================

-- Add battle_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'battles' 
    AND column_name = 'battle_type'
  ) THEN
    ALTER TABLE public.battles ADD COLUMN battle_type TEXT DEFAULT 'mix_battle' 
      CHECK (battle_type IN ('mix_battle', 'song_battle', 'remix_challenge'));
  END IF;
END $$;

-- Add stems_required column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'battles' 
    AND column_name = 'stems_required'
  ) THEN
    ALTER TABLE public.battles ADD COLUMN stems_required BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add prize_pool column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'battles' 
    AND column_name = 'prize_pool'
  ) THEN
    ALTER TABLE public.battles ADD COLUMN prize_pool NUMERIC;
  END IF;
END $$;

-- =====================================================
-- Core Database Functions
-- =====================================================

-- Function to update milestone progress
CREATE OR REPLACE FUNCTION public.update_milestone_progress(
  p_feature_key TEXT,
  p_increment INTEGER DEFAULT 1,
  p_reason TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestone_id UUID;
  v_previous_value INTEGER;
  v_new_value INTEGER;
  v_target_value INTEGER;
  v_is_unlocked BOOLEAN;
  v_milestone_name TEXT;
BEGIN
  -- Get milestone details
  SELECT id, current_value, target_value, is_unlocked, milestone_name
  INTO v_milestone_id, v_previous_value, v_target_value, v_is_unlocked, v_milestone_name
  FROM public.community_milestones
  WHERE feature_key = p_feature_key;

  IF v_milestone_id IS NULL THEN
    RETURN false;
  END IF;

  -- Don't increment if already unlocked
  IF v_is_unlocked THEN
    RETURN true;
  END IF;

  -- Calculate new value
  v_new_value := v_previous_value + p_increment;

  -- Update milestone
  UPDATE public.community_milestones
  SET 
    current_value = v_new_value,
    is_unlocked = (v_new_value >= v_target_value),
    unlocked_at = CASE 
      WHEN v_new_value >= v_target_value THEN now()
      ELSE unlocked_at
    END,
    updated_at = now()
  WHERE id = v_milestone_id;

  -- Log the progress
  INSERT INTO public.milestone_progress_log (
    milestone_id, previous_value, new_value, increment_amount, reason, triggered_by
  ) VALUES (
    v_milestone_id, v_previous_value, v_new_value, p_increment, p_reason, p_user_id
  );

  -- Track contributor if user provided
  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.milestone_contributors (
      milestone_id, user_id, contribution_count, first_contribution_at, last_contribution_at
    ) VALUES (
      v_milestone_id, p_user_id, 1, now(), now()
    )
    ON CONFLICT (milestone_id, user_id) DO UPDATE
    SET 
      contribution_count = milestone_contributors.contribution_count + 1,
      last_contribution_at = now();
  END IF;

  -- If just unlocked, create notification for all admins
  IF v_new_value >= v_target_value AND NOT v_is_unlocked THEN
    -- Create admin notifications
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    SELECT 
      ur.user_id,
      'milestone_unlocked',
      'Community Milestone Unlocked! 🎉',
      'The community has unlocked: ' || v_milestone_name,
      jsonb_build_object('feature_key', p_feature_key, 'milestone_name', v_milestone_name)
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
  END IF;

  RETURN true;
END;
$$;

-- Function to get milestone status
CREATE OR REPLACE FUNCTION public.get_community_milestones_status()
RETURNS TABLE (
  feature_key TEXT,
  milestone_name TEXT,
  milestone_description TEXT,
  current_value INTEGER,
  target_value INTEGER,
  progress_percentage NUMERIC,
  is_unlocked BOOLEAN,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  contributor_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cm.feature_key,
    cm.milestone_name,
    cm.milestone_description,
    cm.current_value,
    cm.target_value,
    ROUND((cm.current_value::NUMERIC / NULLIF(cm.target_value, 0) * 100), 2) as progress_percentage,
    cm.is_unlocked,
    cm.unlocked_at,
    COUNT(DISTINCT mc.user_id) as contributor_count
  FROM public.community_milestones cm
  LEFT JOIN public.milestone_contributors mc ON cm.id = mc.milestone_id
  GROUP BY cm.id, cm.feature_key, cm.milestone_name, cm.milestone_description, 
           cm.current_value, cm.target_value, cm.is_unlocked, cm.unlocked_at
  ORDER BY cm.display_order, cm.created_at;
$$;

-- =====================================================
-- Triggers for Automatic Milestone Tracking
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_profile_milestone_update ON public.profiles;
DROP TRIGGER IF EXISTS on_project_milestone_update ON public.projects;

-- Trigger for user signups
CREATE OR REPLACE FUNCTION public.track_user_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user-count based milestones
  PERFORM update_milestone_progress('MIX_BATTLES_ENABLED', 1, 'New user signup', NEW.id);
  PERFORM update_milestone_progress('EDUCATION_HUB_ENABLED', 1, 'New user signup', NEW.id);
  PERFORM update_milestone_progress('MARKETPLACE_ENABLED', 1, 'New user signup', NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_milestone_update
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.track_user_milestone();

-- Trigger for project completions
CREATE OR REPLACE FUNCTION public.track_project_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update project-count based milestones
    PERFORM update_milestone_progress('MARKETPLACE_ENABLED', 1, 'Project completed', NEW.client_id);
    PERFORM update_milestone_progress('INTEGRATIONS_ENABLED', 1, 'Project completed', NEW.client_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_milestone_update
  AFTER INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.track_project_milestone();

-- =====================================================
-- Initial Milestone Data
-- =====================================================

INSERT INTO public.community_milestones (
  feature_key, milestone_name, milestone_description, milestone_type, 
  target_value, display_order, icon_name, reward_description
) VALUES
  (
    'MIX_BATTLES_ENABLED',
    'Mix Battles Arena',
    'Unlock competitive mix battles where engineers showcase their skills',
    'user_count',
    100,
    1,
    'Trophy',
    'Access to Mix Battles, Song Battles, and Remix Challenges'
  ),
  (
    'EDUCATION_HUB_ENABLED',
    'Knowledge Center',
    'Unlock the educational hub with tutorials and courses',
    'user_count',
    250,
    2,
    'GraduationCap',
    'Video tutorials, mixing courses, and certification programs'
  ),
  (
    'MARKETPLACE_ENABLED',
    'Community Marketplace',
    'Unlock the marketplace for buying and selling presets, samples, and templates',
    'project_count',
    500,
    3,
    'ShoppingBag',
    'Sample libraries, preset collections, and project templates'
  ),
  (
    'INTEGRATIONS_ENABLED',
    'Pro Integrations',
    'Unlock professional DAW plugins and streaming platform integrations',
    'project_count',
    1000,
    4,
    'Puzzle',
    'DAW plugins, Spotify/Apple Music integration, and API access'
  )
ON CONFLICT (feature_key) DO NOTHING;
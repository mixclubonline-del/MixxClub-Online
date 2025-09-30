-- Add platform integration tracking columns to engineer_profiles
ALTER TABLE engineer_profiles 
ADD COLUMN IF NOT EXISTS platform_usage_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tools_mastered JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS collaboration_sessions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS remote_work_percentage DECIMAL DEFAULT 0;

-- Create engineer_tiers table for tracking progression
CREATE TABLE IF NOT EXISTS engineer_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier_name TEXT NOT NULL CHECK (tier_name IN ('bronze', 'silver', 'gold', 'platinum')),
  revenue_split_percentage DECIMAL NOT NULL,
  platform_bonus_percentage DECIMAL DEFAULT 0,
  requirements JSONB DEFAULT '{}'::jsonb,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(engineer_id, tier_name)
);

-- Create platform_usage_tracking table
CREATE TABLE IF NOT EXISTS platform_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tools_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  platform_completion_percentage DECIMAL DEFAULT 0,
  integration_bonus_earned DECIMAL DEFAULT 0,
  remote_session_used BOOLEAN DEFAULT false,
  ai_tools_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create performance_bonuses table
CREATE TABLE IF NOT EXISTS performance_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  bonus_type TEXT NOT NULL,
  bonus_amount DECIMAL NOT NULL,
  description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid'))
);

-- Create remote_session_analytics table
CREATE TABLE IF NOT EXISTS remote_session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE NOT NULL,
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  tools_used JSONB DEFAULT '[]'::jsonb,
  success_rating DECIMAL,
  client_satisfaction DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE engineer_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_session_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engineer_tiers
CREATE POLICY "Engineers can view their own tiers"
  ON engineer_tiers FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Everyone can view all engineer tiers"
  ON engineer_tiers FOR SELECT
  USING (true);

CREATE POLICY "System can manage tiers"
  ON engineer_tiers FOR ALL
  USING (true);

-- RLS Policies for platform_usage_tracking
CREATE POLICY "Engineers can view their own usage"
  ON platform_usage_tracking FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Admins can view all usage"
  ON platform_usage_tracking FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can track usage"
  ON platform_usage_tracking FOR ALL
  USING (true);

-- RLS Policies for performance_bonuses
CREATE POLICY "Engineers can view their own bonuses"
  ON performance_bonuses FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Admins can manage bonuses"
  ON performance_bonuses FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for remote_session_analytics
CREATE POLICY "Engineers can view their own analytics"
  ON remote_session_analytics FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Admins can view all analytics"
  ON remote_session_analytics FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can track analytics"
  ON remote_session_analytics FOR ALL
  USING (true);

-- Create trigger for updating platform_usage_tracking timestamp
CREATE TRIGGER update_platform_usage_updated_at
  BEFORE UPDATE ON platform_usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
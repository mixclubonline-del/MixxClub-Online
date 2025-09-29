-- Extend profiles table for gamification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create tasks table for engineer assignments
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  engineer_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasks
CREATE POLICY "Users can view tasks for their projects"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Engineers can update their assigned tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = engineer_id);

CREATE POLICY "Project owners can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    )
  );

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create collaboration_comments table
CREATE TABLE IF NOT EXISTS collaboration_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  timestamp_seconds REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE collaboration_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their projects"
  ON collaboration_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaboration_comments.project_id
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on their projects"
  ON collaboration_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaboration_comments.project_id
      AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
    )
  );

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = client_id OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = payments.project_id
    AND projects.engineer_id = auth.uid()
  ));

CREATE POLICY "Clients can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to award points
CREATE OR REPLACE FUNCTION award_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add achievement
CREATE OR REPLACE FUNCTION add_achievement(
  p_user_id UUID,
  p_badge_type TEXT,
  p_badge_name TEXT,
  p_badge_description TEXT
)
RETURNS UUID AS $$
DECLARE
  achievement_id UUID;
BEGIN
  INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
  VALUES (p_user_id, p_badge_type, p_badge_name, p_badge_description)
  RETURNING id INTO achievement_id;
  
  RETURN achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create tutorials table
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('getting-started', 'artist', 'engineer', 'feature', 'advanced')),
  target_roles TEXT[] DEFAULT '{}',
  estimated_minutes INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tutorial_steps table
CREATE TABLE tutorial_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_element TEXT,
  position TEXT DEFAULT 'bottom' CHECK (position IN ('top', 'bottom', 'left', 'right', 'center')),
  action_type TEXT DEFAULT 'next' CHECK (action_type IN ('next', 'click', 'input', 'navigate')),
  action_target TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_tutorial_progress table
CREATE TABLE user_tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE NOT NULL,
  current_step INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

-- Enable RLS
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tutorial_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutorials
CREATE POLICY "Everyone can view active tutorials"
  ON tutorials FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage tutorials"
  ON tutorials FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for tutorial_steps
CREATE POLICY "Everyone can view tutorial steps"
  ON tutorial_steps FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tutorials
    WHERE tutorials.id = tutorial_steps.tutorial_id
    AND tutorials.is_active = true
  ));

CREATE POLICY "Admins can manage tutorial steps"
  ON tutorial_steps FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_tutorial_progress
CREATE POLICY "Users can view their own progress"
  ON user_tutorial_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON user_tutorial_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_tutorial_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_tutorial_steps_tutorial_id ON tutorial_steps(tutorial_id);
CREATE INDEX idx_user_tutorial_progress_user_id ON user_tutorial_progress(user_id);
CREATE INDEX idx_user_tutorial_progress_tutorial_id ON user_tutorial_progress(tutorial_id);

-- Seed initial tutorials
INSERT INTO tutorials (slug, title, description, category, target_roles, estimated_minutes, sort_order) VALUES
  ('welcome-to-mixxclub', 'Welcome to Mixxclub', 'Get started with the platform and learn the basics', 'getting-started', ARRAY['all'], 5, 1),
  ('setting-up-profile', 'Setting Up Your Profile', 'Complete your profile to attract collaborators', 'getting-started', ARRAY['all'], 8, 2),
  ('understanding-dashboard', 'Understanding Your Dashboard', 'Navigate your personalized command center', 'getting-started', ARRAY['all'], 7, 3),
  ('finding-engineers', 'Finding the Perfect Engineer', 'Use AI matching to discover ideal collaborators', 'artist', ARRAY['artist'], 10, 4),
  ('creating-session', 'Creating Your First Session', 'Set up a collaboration session and invite engineers', 'artist', ARRAY['artist'], 12, 5),
  ('using-ai-mastering', 'Using AI Mastering', 'Master your tracks with AI-powered tools', 'feature', ARRAY['artist', 'engineer'], 15, 6),
  ('revenue-streams', 'Managing Your Revenue Streams', 'Maximize earnings across 10 revenue systems', 'artist', ARRAY['artist'], 10, 7),
  ('building-engineer-profile', 'Building Your Engineering Profile', 'Create a profile that attracts clients', 'engineer', ARRAY['engineer'], 12, 8),
  ('managing-sessions', 'Managing Client Sessions', 'Efficient workflow for client projects', 'engineer', ARRAY['engineer'], 15, 9),
  ('getting-paid', 'Getting Paid', 'Understand earnings, payouts, and bonuses', 'engineer', ARRAY['engineer'], 8, 10);

-- Seed tutorial steps for "Welcome to Mixxclub"
INSERT INTO tutorial_steps (tutorial_id, step_order, title, description, target_element, position, action_type) VALUES
  ((SELECT id FROM tutorials WHERE slug = 'welcome-to-mixxclub'), 1, 'Welcome!', 'Welcome to Mixxclub - your AI-powered music collaboration platform. Let''s take a quick tour!', NULL, 'center', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'welcome-to-mixxclub'), 2, 'Your Dashboard', 'This is your Dashboard Hub - your career command center where you track momentum, revenue, and opportunities.', '[data-tour="dashboard"]', 'bottom', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'welcome-to-mixxclub'), 3, 'Navigation', 'Use the sidebar to navigate between different hubs: Opportunities, Active Work, Sessions, and more.', '[data-tour="sidebar"]', 'right', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'welcome-to-mixxclub'), 4, 'Get Started', 'That''s it! You''re ready to start collaborating. Click Next to finish.', NULL, 'center', 'next');

-- Seed tutorial steps for "Setting Up Your Profile"
INSERT INTO tutorial_steps (tutorial_id, step_order, title, description, target_element, position, action_type) VALUES
  ((SELECT id FROM tutorials WHERE slug = 'setting-up-profile'), 1, 'Complete Your Profile', 'A complete profile helps you connect with the right collaborators. Let''s set it up!', NULL, 'center', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'setting-up-profile'), 2, 'Profile Settings', 'Click on your profile menu to access settings.', '[data-tour="profile-menu"]', 'bottom', 'click'),
  ((SELECT id FROM tutorials WHERE slug = 'setting-up-profile'), 3, 'Add Your Details', 'Fill in your bio, skills, genres, and experience to stand out.', '[data-tour="profile-form"]', 'left', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'setting-up-profile'), 4, 'Upload Portfolio', 'Showcase your best work to attract clients or collaborators.', '[data-tour="portfolio-upload"]', 'top', 'next');

-- Seed tutorial steps for "Understanding Your Dashboard"
INSERT INTO tutorial_steps (tutorial_id, step_order, title, description, target_element, position, action_type) VALUES
  ((SELECT id FROM tutorials WHERE slug = 'understanding-dashboard'), 1, 'Dashboard Overview', 'Your dashboard shows career momentum, active projects, and key metrics at a glance.', NULL, 'center', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'understanding-dashboard'), 2, 'Career Stats', 'Track your level, XP, streak, and weekly goals here.', '[data-tour="career-stats"]', 'bottom', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'understanding-dashboard'), 3, 'Revenue Streams', 'Monitor all 10 revenue streams in one place.', '[data-tour="revenue-widget"]', 'top', 'next'),
  ((SELECT id FROM tutorials WHERE slug = 'understanding-dashboard'), 4, 'Quick Actions', 'Access frequently used features with quick action buttons.', '[data-tour="quick-actions"]', 'left', 'next');
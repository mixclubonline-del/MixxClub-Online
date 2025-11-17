-- Add missing fields to audio_files
ALTER TABLE public.audio_files
  ADD COLUMN duration_seconds DECIMAL(10, 2),
  ADD COLUMN uploaded_by UUID REFERENCES auth.users(id),
  ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add missing field to battler_stats
ALTER TABLE public.battler_stats
  ADD COLUMN overall_score DECIMAL(10, 2);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view all achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- Create battle_votes table
CREATE TABLE public.battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.battles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voted_for TEXT NOT NULL,
  winner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (battle_id, user_id)
);

ALTER TABLE public.battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view battle votes"
  ON public.battle_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create votes"
  ON public.battle_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create engineer_deliverables table
CREATE TABLE public.engineer_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  engineer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.engineer_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers and project owners can view deliverables"
  ON public.engineer_deliverables FOR SELECT
  USING (
    auth.uid() = engineer_id OR
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Engineers can create deliverables"
  ON public.engineer_deliverables FOR INSERT
  WITH CHECK (auth.uid() = engineer_id);

CREATE POLICY "Project owners can update deliverable status"
  ON public.engineer_deliverables FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE TRIGGER update_engineer_deliverables_updated_at
  BEFORE UPDATE ON public.engineer_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create ai_mixing_suggestions table
CREATE TABLE public.ai_mixing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_applied BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3, 2),
  technical_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_mixing_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their project suggestions"
  ON public.ai_mixing_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create suggestions"
  ON public.ai_mixing_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their suggestions"
  ON public.ai_mixing_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_audio_files_uploaded_by ON public.audio_files(uploaded_by);
CREATE INDEX idx_audio_files_project ON public.audio_files(project_id);
CREATE INDEX idx_achievements_user ON public.achievements(user_id);
CREATE INDEX idx_battle_votes_battle ON public.battle_votes(battle_id);
CREATE INDEX idx_battle_votes_user ON public.battle_votes(user_id);
CREATE INDEX idx_engineer_deliverables_project ON public.engineer_deliverables(project_id);
CREATE INDEX idx_engineer_deliverables_engineer ON public.engineer_deliverables(engineer_id);
CREATE INDEX idx_ai_mixing_suggestions_project ON public.ai_mixing_suggestions(project_id);
CREATE INDEX idx_ai_mixing_suggestions_user ON public.ai_mixing_suggestions(user_id);
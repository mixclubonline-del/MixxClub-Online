
-- Pathfinder walkthrough progress tracking
CREATE TABLE public.pathfinder_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  journey_id TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, journey_id)
);

ALTER TABLE public.pathfinder_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pathfinder progress"
  ON public.pathfinder_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pathfinder progress"
  ON public.pathfinder_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pathfinder progress"
  ON public.pathfinder_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_pathfinder_progress_updated_at
  BEFORE UPDATE ON public.pathfinder_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

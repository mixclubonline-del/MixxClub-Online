-- Create user matching preferences table for smart engineer matching
CREATE TABLE IF NOT EXISTS public.user_matching_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferred_genres TEXT[] DEFAULT '{}',
  budget_range TEXT,
  project_types TEXT[] DEFAULT '{}',
  preferred_engineer_styles JSONB DEFAULT '{}',
  audio_analysis_preferences JSONB DEFAULT '{}',
  match_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_matching_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for user matching preferences
CREATE POLICY "Users can view their own matching preferences"
  ON public.user_matching_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matching preferences"
  ON public.user_matching_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matching preferences"
  ON public.user_matching_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_matching_preferences_user_id ON public.user_matching_preferences(user_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_matching_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matching_preferences_updated_at
  BEFORE UPDATE ON public.user_matching_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_matching_preferences_updated_at();
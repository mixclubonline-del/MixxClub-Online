-- Create premieres table
CREATE TABLE IF NOT EXISTS public.premieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES auth.users(id),
  engineer_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  artwork_url TEXT,
  genre TEXT,
  bpm INTEGER,
  key_signature TEXT,
  premiere_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  total_votes INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create premiere_votes table
CREATE TABLE IF NOT EXISTS public.premiere_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  premiere_id UUID NOT NULL REFERENCES public.premieres(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('overall', 'mix_quality', 'production', 'creativity', 'vibe')),
  vote_value INTEGER NOT NULL CHECK (vote_value BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(premiere_id, user_id, vote_type)
);

-- Create fan_stats table
CREATE TABLE IF NOT EXISTS public.fan_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  total_votes INTEGER DEFAULT 0,
  total_listens INTEGER DEFAULT 0,
  taste_maker_score INTEGER DEFAULT 0,
  discovery_count INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  weekly_votes INTEGER DEFAULT 0,
  week_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create premiere_comments table
CREATE TABLE IF NOT EXISTS public.premiere_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  premiere_id UUID NOT NULL REFERENCES public.premieres(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  parent_id UUID REFERENCES public.premiere_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.premieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premiere_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premiere_comments ENABLE ROW LEVEL SECURITY;

-- Premieres policies
CREATE POLICY "Anyone can view live and ended premieres"
  ON public.premieres FOR SELECT
  USING (status IN ('live', 'ended'));

CREATE POLICY "Artists can view their own scheduled premieres"
  ON public.premieres FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create premieres from their projects"
  ON public.premieres FOR INSERT
  WITH CHECK (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = premieres.project_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Artists can update their own premieres"
  ON public.premieres FOR UPDATE
  USING (auth.uid() = artist_id);

-- Votes policies
CREATE POLICY "Users can view votes for live/ended premieres"
  ON public.premiere_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.premieres
      WHERE premieres.id = premiere_votes.premiere_id
      AND premieres.status IN ('live', 'ended')
    )
  );

CREATE POLICY "Users can vote on live premieres"
  ON public.premiere_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.premieres
      WHERE premieres.id = premiere_votes.premiere_id
      AND premieres.status = 'live'
      AND premieres.artist_id != auth.uid()
    )
  );

CREATE POLICY "Users can update their own votes"
  ON public.premiere_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Fan stats policies
CREATE POLICY "Users can view their own fan stats"
  ON public.fan_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public fan stats"
  ON public.fan_stats FOR SELECT
  USING (true);

CREATE POLICY "System can manage fan stats"
  ON public.fan_stats FOR ALL
  USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments on live/ended premieres"
  ON public.premiere_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.premieres
      WHERE premieres.id = premiere_comments.premiere_id
      AND premieres.status IN ('live', 'ended')
    )
  );

CREATE POLICY "Users can create comments on live premieres"
  ON public.premiere_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.premieres
      WHERE premieres.id = premiere_comments.premiere_id
      AND premieres.status = 'live'
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.premiere_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.premiere_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_premieres_status ON public.premieres(status);
CREATE INDEX idx_premieres_premiere_date ON public.premieres(premiere_date DESC);
CREATE INDEX idx_premieres_artist ON public.premieres(artist_id);
CREATE INDEX idx_premiere_votes_premiere ON public.premiere_votes(premiere_id);
CREATE INDEX idx_premiere_votes_user ON public.premiere_votes(user_id);
CREATE INDEX idx_premiere_comments_premiere ON public.premiere_comments(premiere_id);

-- Create function to update premiere stats
CREATE OR REPLACE FUNCTION update_premiere_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.premieres
  SET 
    total_votes = (
      SELECT COUNT(DISTINCT user_id)
      FROM public.premiere_votes
      WHERE premiere_id = NEW.premiere_id
    ),
    average_rating = (
      SELECT AVG(vote_value)
      FROM public.premiere_votes
      WHERE premiere_id = NEW.premiere_id
      AND vote_type = 'overall'
    ),
    updated_at = now()
  WHERE id = NEW.premiere_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for premiere stats
CREATE TRIGGER update_premiere_stats_trigger
AFTER INSERT OR UPDATE ON public.premiere_votes
FOR EACH ROW
EXECUTE FUNCTION update_premiere_stats();

-- Create function to update fan stats
CREATE OR REPLACE FUNCTION update_fan_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.fan_stats (user_id, total_votes, weekly_votes)
  VALUES (NEW.user_id, 1, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_votes = fan_stats.total_votes + 1,
    weekly_votes = fan_stats.weekly_votes + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for fan stats
CREATE TRIGGER update_fan_stats_trigger
AFTER INSERT ON public.premiere_votes
FOR EACH ROW
EXECUTE FUNCTION update_fan_stats();
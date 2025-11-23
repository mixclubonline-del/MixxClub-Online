-- Add missing columns
ALTER TABLE chatbot_messages ADD COLUMN IF NOT EXISTS chatbot_type TEXT DEFAULT 'general';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS badge_description TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS badge_type TEXT;
ALTER TABLE battle_tournaments ADD COLUMN IF NOT EXISTS entry_fee NUMERIC DEFAULT 0;
ALTER TABLE premieres ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;

-- Add missing columns to project_reviews
ALTER TABLE project_reviews 
ADD COLUMN IF NOT EXISTS communication_rating NUMERIC,
ADD COLUMN IF NOT EXISTS quality_rating NUMERIC,
ADD COLUMN IF NOT EXISTS timeliness_rating NUMERIC,
ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES profiles(id);

-- Create fan_stats table
CREATE TABLE IF NOT EXISTS fan_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_votes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_premieres_attended INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE fan_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fan stats"
  ON fan_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Create premiere_votes table  
CREATE TABLE IF NOT EXISTS premiere_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  premiere_id UUID NOT NULL REFERENCES premieres(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(premiere_id, user_id)
);

ALTER TABLE premiere_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on premieres"
  ON premiere_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view premiere votes"
  ON premiere_votes FOR SELECT
  USING (true);

-- Create triggers
CREATE TRIGGER update_fan_stats_updated_at
  BEFORE UPDATE ON fan_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
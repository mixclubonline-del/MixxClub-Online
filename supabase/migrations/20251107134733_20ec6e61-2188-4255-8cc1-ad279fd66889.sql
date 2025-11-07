-- Add trending score and leaderboard position columns to premieres
ALTER TABLE premieres 
ADD COLUMN IF NOT EXISTS trending_score DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_rank INTEGER,
ADD COLUMN IF NOT EXISTS monthly_rank INTEGER;

-- Create leaderboard prizes table
CREATE TABLE IF NOT EXISTS leaderboard_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  premiere_id UUID REFERENCES premieres(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_type TEXT CHECK (prize_type IN ('weekly_winner', 'monthly_winner', 'top_3_weekly', 'top_10_monthly')),
  rank INTEGER,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  prize_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add badges to fan_stats
ALTER TABLE fan_stats
ADD COLUMN IF NOT EXISTS leaderboard_badges JSONB DEFAULT '[]'::jsonb;

-- Create index for trending scores
CREATE INDEX IF NOT EXISTS idx_premieres_trending_score ON premieres(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_premieres_weekly_rank ON premieres(weekly_rank);
CREATE INDEX IF NOT EXISTS idx_premieres_monthly_rank ON premieres(monthly_rank);

-- Enable RLS
ALTER TABLE leaderboard_prizes ENABLE ROW LEVEL SECURITY;

-- RLS policies for leaderboard_prizes
CREATE POLICY "Leaderboard prizes are viewable by everyone"
ON leaderboard_prizes FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert leaderboard prizes"
ON leaderboard_prizes FOR INSERT
WITH CHECK (false);

CREATE POLICY "Only admins can update leaderboard prizes"
ON leaderboard_prizes FOR UPDATE
USING (false);

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(
  total_votes INTEGER,
  average_rating DECIMAL,
  play_count INTEGER,
  premiere_date TIMESTAMPTZ
)
RETURNS DECIMAL AS $$
DECLARE
  hours_since_premiere DECIMAL;
  time_decay DECIMAL;
  vote_score DECIMAL;
  rating_boost DECIMAL;
  play_boost DECIMAL;
  trending_score DECIMAL;
BEGIN
  -- Calculate hours since premiere
  hours_since_premiere := EXTRACT(EPOCH FROM (NOW() - premiere_date)) / 3600;
  
  -- Prevent division by zero
  IF hours_since_premiere < 1 THEN
    hours_since_premiere := 1;
  END IF;
  
  -- Time decay factor (exponential decay with 48-hour half-life)
  time_decay := EXP(-0.014 * hours_since_premiere);
  
  -- Vote score (weighted by recency)
  vote_score := total_votes * time_decay;
  
  -- Rating boost (higher ratings get more weight)
  rating_boost := COALESCE(average_rating, 0) / 5.0;
  
  -- Play count boost (logarithmic scaling)
  play_boost := LN(GREATEST(play_count, 1) + 1) * 0.5;
  
  -- Calculate final trending score
  trending_score := (vote_score * (1 + rating_boost)) + play_boost;
  
  RETURN ROUND(trending_score, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
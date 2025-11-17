-- Add missing fields to battles
ALTER TABLE public.battles
  ADD COLUMN votes_count INTEGER DEFAULT 0,
  ADD COLUMN views_count INTEGER DEFAULT 0;

-- Create battle_tournaments table
CREATE TABLE public.battle_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  prize_pool DECIMAL(10, 2),
  current_participants INTEGER DEFAULT 0,
  max_participants INTEGER,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.battle_tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view tournaments"
  ON public.battle_tournaments FOR SELECT
  USING (true);

-- Create battler_stats table
CREATE TABLE public.battler_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  battler_name TEXT NOT NULL,
  total_battles INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2),
  ranking_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.battler_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view battler stats"
  ON public.battler_stats FOR SELECT
  USING (true);

-- Sample Packs table (8C.4)
CREATE TABLE public.sample_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sample_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published sample packs"
  ON public.sample_packs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Producers can manage their own packs"
  ON public.sample_packs FOR ALL
  TO authenticated
  USING (producer_id = auth.uid())
  WITH CHECK (producer_id = auth.uid());

-- Battle Seasons table (8D.2)
CREATE TABLE public.battle_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  season_number INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming',
  prize_pool_cents INTEGER DEFAULT 0,
  rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.battle_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read battle seasons"
  ON public.battle_seasons FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage battle seasons"
  ON public.battle_seasons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Battle Season Entries table
CREATE TABLE public.battle_season_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.battle_seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  trophies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, user_id)
);

ALTER TABLE public.battle_season_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read season entries"
  ON public.battle_season_entries FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage season entries"
  ON public.battle_season_entries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime on stream chat messages (8D.1)
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;

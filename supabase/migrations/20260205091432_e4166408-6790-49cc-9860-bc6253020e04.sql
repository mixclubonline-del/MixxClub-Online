-- Phase 1: Database Foundation for Producer & Fan CRM Expansion

-- 1.1 Extend app_role enum with producer and fan
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'producer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fan';

-- 1.2 Create producer_beats table (catalog management)
CREATE TABLE public.producer_beats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  bpm integer,
  key_signature text,
  genre text,
  tags text[],
  audio_url text,
  preview_url text,
  cover_image_url text,
  price_cents integer DEFAULT 0,
  license_type text DEFAULT 'lease',
  is_exclusive_available boolean DEFAULT true,
  exclusive_price_cents integer,
  downloads integer DEFAULT 0,
  plays integer DEFAULT 0,
  status text DEFAULT 'draft',
  description text,
  mood text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 1.3 Create producer_stats table (analytics)
CREATE TABLE public.producer_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_beats integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_revenue_cents integer DEFAULT 0,
  total_plays integer DEFAULT 0,
  total_downloads integer DEFAULT 0,
  avg_rating numeric(3,2),
  monthly_plays integer DEFAULT 0,
  monthly_sales integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 1.4 Enhance fan_stats table with economy columns
ALTER TABLE public.fan_stats 
  ADD COLUMN IF NOT EXISTS mixxcoinz_earned integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS artists_supported integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS day1_badges integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_tier text DEFAULT 'listener',
  ADD COLUMN IF NOT EXISTS total_votes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_shares integer DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.producer_beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for producer_beats
CREATE POLICY "Users can view published beats"
  ON public.producer_beats FOR SELECT
  USING (status = 'published' OR producer_id = auth.uid());

CREATE POLICY "Producers can insert their own beats"
  ON public.producer_beats FOR INSERT
  TO authenticated
  WITH CHECK (producer_id = auth.uid());

CREATE POLICY "Producers can update their own beats"
  ON public.producer_beats FOR UPDATE
  TO authenticated
  USING (producer_id = auth.uid())
  WITH CHECK (producer_id = auth.uid());

CREATE POLICY "Producers can delete their own beats"
  ON public.producer_beats FOR DELETE
  TO authenticated
  USING (producer_id = auth.uid());

-- RLS Policies for producer_stats
CREATE POLICY "Users can view any producer stats"
  ON public.producer_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own producer stats"
  ON public.producer_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own producer stats"
  ON public.producer_stats FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_producer_beats_producer_id ON public.producer_beats(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_beats_status ON public.producer_beats(status);
CREATE INDEX IF NOT EXISTS idx_producer_beats_genre ON public.producer_beats(genre);
CREATE INDEX IF NOT EXISTS idx_producer_stats_user_id ON public.producer_stats(user_id);

-- Trigger to update producer_beats updated_at
CREATE TRIGGER update_producer_beats_updated_at
  BEFORE UPDATE ON public.producer_beats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update producer_stats updated_at  
CREATE TRIGGER update_producer_stats_updated_at
  BEFORE UPDATE ON public.producer_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
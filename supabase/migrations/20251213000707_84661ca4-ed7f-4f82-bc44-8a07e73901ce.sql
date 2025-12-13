-- Fix premieres table schema to match code expectations

-- Rename existing columns to match code
ALTER TABLE public.premieres 
  RENAME COLUMN premiere_title TO title;

ALTER TABLE public.premieres 
  RENAME COLUMN premiere_description TO description;

ALTER TABLE public.premieres 
  RENAME COLUMN streaming_url TO audio_url;

ALTER TABLE public.premieres 
  RENAME COLUMN user_id TO artist_id;

-- Add new columns for fan portal features
ALTER TABLE public.premieres
  ADD COLUMN IF NOT EXISTS artwork_url TEXT,
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS bpm INTEGER,
  ADD COLUMN IF NOT EXISTS total_votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trending_score NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_rank INTEGER,
  ADD COLUMN IF NOT EXISTS monthly_rank INTEGER,
  ADD COLUMN IF NOT EXISTS engineer_id UUID;

-- Create indexes for trending queries
CREATE INDEX IF NOT EXISTS idx_premieres_trending ON public.premieres(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_premieres_status ON public.premieres(status);
CREATE INDEX IF NOT EXISTS idx_premieres_genre ON public.premieres(genre);

-- Add RLS policy for fans to view live premieres
CREATE POLICY "Anyone can view live premieres" 
ON public.premieres 
FOR SELECT 
USING (status = 'live' OR status = 'scheduled');

-- Enable realtime for premieres
ALTER PUBLICATION supabase_realtime ADD TABLE public.premieres;
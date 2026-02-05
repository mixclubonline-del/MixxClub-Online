-- Extend partnerships table for Producer↔Artist collaborations
ALTER TABLE public.partnerships
ADD COLUMN IF NOT EXISTS producer_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS partnership_type text NOT NULL DEFAULT 'artist_engineer',
ADD COLUMN IF NOT EXISTS beat_id uuid REFERENCES public.producer_beats(id),
ADD COLUMN IF NOT EXISTS producer_percentage numeric DEFAULT 50,
ADD COLUMN IF NOT EXISTS producer_earnings numeric DEFAULT 0;

-- Make engineer_id nullable for producer partnerships
ALTER TABLE public.partnerships
ALTER COLUMN engineer_id DROP NOT NULL;

-- Add constraint for valid partnership parties
ALTER TABLE public.partnerships
DROP CONSTRAINT IF EXISTS valid_partnership_parties;

ALTER TABLE public.partnerships
ADD CONSTRAINT valid_partnership_parties CHECK (
  (partnership_type = 'artist_engineer' AND artist_id IS NOT NULL AND engineer_id IS NOT NULL) OR
  (partnership_type = 'producer_artist' AND producer_id IS NOT NULL AND artist_id IS NOT NULL)
);

-- Indexes for producer partnerships
CREATE INDEX IF NOT EXISTS idx_partnerships_producer ON public.partnerships(producer_id) WHERE producer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partnerships_type ON public.partnerships(partnership_type);

-- Create track_releases table
CREATE TABLE IF NOT EXISTS public.track_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  beat_id uuid REFERENCES public.producer_beats(id),
  track_title text NOT NULL,
  artist_name text,
  release_date date,
  streaming_platforms jsonb DEFAULT '{}',
  isrc_code text,
  upc_code text,
  cover_art_url text,
  status text DEFAULT 'unreleased' CHECK (status IN ('unreleased', 'pending', 'released', 'archived')),
  total_streams bigint DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.track_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partnership members can view releases"
  ON public.track_releases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = track_releases.partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can insert releases"
  ON public.track_releases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can update releases"
  ON public.track_releases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = track_releases.partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid())
    )
  );

-- Create beat_royalties table
CREATE TABLE IF NOT EXISTS public.beat_royalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  track_release_id uuid REFERENCES public.track_releases(id),
  beat_id uuid REFERENCES public.producer_beats(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  platform text,
  stream_count bigint DEFAULT 0,
  gross_revenue numeric NOT NULL DEFAULT 0,
  producer_amount numeric NOT NULL DEFAULT 0,
  artist_amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric DEFAULT 0,
  producer_percentage numeric NOT NULL,
  artist_percentage numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beat_royalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partnership members can view royalties"
  ON public.beat_royalties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = beat_royalties.partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can insert royalties"
  ON public.beat_royalties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can update royalties"
  ON public.beat_royalties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = beat_royalties.partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_beat_royalties_partnership ON public.beat_royalties(partnership_id);
CREATE INDEX IF NOT EXISTS idx_beat_royalties_period ON public.beat_royalties(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_track_releases_partnership ON public.track_releases(partnership_id);

-- Update trigger for track_releases
CREATE TRIGGER update_track_releases_updated_at
  BEFORE UPDATE ON public.track_releases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update partnership revenue from royalties
CREATE OR REPLACE FUNCTION public.update_partnership_from_royalty()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.partnerships
  SET 
    total_revenue = COALESCE(total_revenue, 0) + NEW.gross_revenue,
    artist_earnings = COALESCE(artist_earnings, 0) + NEW.artist_amount,
    producer_earnings = COALESCE(producer_earnings, 0) + NEW.producer_amount,
    updated_at = now()
  WHERE id = NEW.partnership_id;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_partnership_on_royalty
  AFTER INSERT ON public.beat_royalties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_partnership_from_royalty();
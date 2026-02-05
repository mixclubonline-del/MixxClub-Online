-- =====================================================
-- Create streaming_royalties table for tracking streaming platform earnings
-- =====================================================
CREATE TABLE public.streaming_royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'apple_music', 'youtube', 'tidal', 'amazon_music', 'deezer', 'soundcloud', 'other')),
  track_id UUID REFERENCES public.audio_files(id) ON DELETE SET NULL,
  track_name TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  streams_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'disputed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Create licensing_agreements table for sync/licensing deals
-- =====================================================
CREATE TABLE public.licensing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licensor_id UUID NOT NULL,
  track_id UUID REFERENCES public.audio_files(id) ON DELETE SET NULL,
  track_name TEXT,
  licensee_name TEXT NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('sync', 'master', 'mechanical', 'performance', 'blanket')),
  usage_context TEXT CHECK (usage_context IN ('film', 'tv', 'commercial', 'game', 'web', 'podcast', 'social_media', 'other')),
  amount_cents INTEGER NOT NULL,
  royalty_percentage NUMERIC(5,2),
  upfront_fee_cents INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'terminated')),
  contract_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Enable RLS on both tables
-- =====================================================
ALTER TABLE public.streaming_royalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licensing_agreements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for streaming_royalties
-- =====================================================
CREATE POLICY "Users can view their own royalties"
  ON public.streaming_royalties FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own royalties"
  ON public.streaming_royalties FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own royalties"
  ON public.streaming_royalties FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- RLS Policies for licensing_agreements
-- =====================================================
CREATE POLICY "Users can view their own licensing agreements"
  ON public.licensing_agreements FOR SELECT
  USING (licensor_id = auth.uid());

CREATE POLICY "Users can create their own licensing agreements"
  ON public.licensing_agreements FOR INSERT
  WITH CHECK (licensor_id = auth.uid());

CREATE POLICY "Users can update their own licensing agreements"
  ON public.licensing_agreements FOR UPDATE
  USING (licensor_id = auth.uid());

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX idx_streaming_royalties_user_id ON public.streaming_royalties(user_id);
CREATE INDEX idx_streaming_royalties_period ON public.streaming_royalties(period_start, period_end);
CREATE INDEX idx_streaming_royalties_status ON public.streaming_royalties(status);

CREATE INDEX idx_licensing_agreements_licensor_id ON public.licensing_agreements(licensor_id);
CREATE INDEX idx_licensing_agreements_status ON public.licensing_agreements(status);
CREATE INDEX idx_licensing_agreements_dates ON public.licensing_agreements(start_date, end_date);

-- =====================================================
-- Triggers for updated_at
-- =====================================================
CREATE TRIGGER update_streaming_royalties_updated_at
  BEFORE UPDATE ON public.streaming_royalties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licensing_agreements_updated_at
  BEFORE UPDATE ON public.licensing_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- ============================================
-- CALENDAR & EVENTS SYSTEM FOR ADMIN MIXBOT
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('deadline', 'reminder', 'milestone', 'meeting', 'release', 'review')),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  reminder_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_calendar_user ON public.admin_calendar_events(user_id);
CREATE INDEX idx_admin_calendar_date ON public.admin_calendar_events(event_date);
CREATE INDEX idx_admin_calendar_status ON public.admin_calendar_events(status);

-- RLS Policies
ALTER TABLE public.admin_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their calendar events"
  ON public.admin_calendar_events
  FOR ALL
  USING (is_admin(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Admins can view their calendar events"
  ON public.admin_calendar_events
  FOR SELECT
  USING (is_admin(auth.uid()) AND auth.uid() = user_id);

-- ============================================
-- WHITE-LABEL DISTRIBUTION PACKAGES (PHASE 2)
-- ============================================

CREATE TABLE IF NOT EXISTS public.white_label_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('labelgrid', 'limbomusic', 'aioten', 'custom')),
  api_endpoint TEXT,
  api_key_required BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]',
  pricing_model JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.distribution_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.white_label_providers(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'professional', 'premium', 'enterprise')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'one-time')),
  features JSONB DEFAULT '[]',
  stores_included TEXT[] DEFAULT '{}',
  territory_coverage TEXT DEFAULT 'worldwide',
  revenue_split_percentage NUMERIC(5,2) DEFAULT 100.00,
  max_releases INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_distribution_packages_provider ON public.distribution_packages(provider_id);
CREATE INDEX idx_distribution_packages_active ON public.distribution_packages(is_active);

-- User package subscriptions
CREATE TABLE IF NOT EXISTS public.user_distribution_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.distribution_packages(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  releases_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_dist_subs_user ON public.user_distribution_subscriptions(user_id);
CREATE INDEX idx_user_dist_subs_status ON public.user_distribution_subscriptions(status);

-- RLS Policies
ALTER TABLE public.white_label_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_distribution_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active providers"
  ON public.white_label_providers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Everyone can view active packages"
  ON public.distribution_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their subscriptions"
  ON public.user_distribution_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their subscriptions"
  ON public.user_distribution_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- PLAYLIST PITCHING SYSTEM (PHASE 3)
-- ============================================

CREATE TABLE IF NOT EXISTS public.playlist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES public.music_releases(id) ON DELETE CASCADE,
  playlist_name TEXT NOT NULL,
  playlist_curator TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'apple_music', 'youtube_music', 'tidal', 'other')),
  submission_status TEXT DEFAULT 'pending' CHECK (submission_status IN ('pending', 'submitted', 'accepted', 'rejected', 'playlist_added')),
  submission_date TIMESTAMPTZ DEFAULT now(),
  response_date TIMESTAMPTZ,
  track_url TEXT,
  curator_email TEXT,
  pitch_message TEXT,
  playlist_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_playlist_submissions_user ON public.playlist_submissions(user_id);
CREATE INDEX idx_playlist_submissions_status ON public.playlist_submissions(submission_status);
CREATE INDEX idx_playlist_submissions_platform ON public.playlist_submissions(platform);

-- RLS Policies
ALTER TABLE public.playlist_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their playlist submissions"
  ON public.playlist_submissions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- REVENUE SHARING & COMMISSIONS (PHASE 4)
-- ============================================

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.distribution_referrals(id) ON DELETE SET NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('referral', 'revenue_share', 'performance_bonus', 'affiliate')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  payout_date TIMESTAMPTZ,
  payment_method TEXT,
  transaction_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_affiliate_commissions_user ON public.affiliate_commissions(user_id);
CREATE INDEX idx_affiliate_commissions_status ON public.affiliate_commissions(status);

-- RLS Policies
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their commissions"
  ON public.affiliate_commissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all commissions"
  ON public.affiliate_commissions FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Update calendar event status based on dates
CREATE OR REPLACE FUNCTION update_calendar_event_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.event_date < now() THEN
    NEW.status := 'overdue';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_status_trigger
  BEFORE UPDATE ON public.admin_calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_event_status();

-- Track distribution subscription usage
CREATE OR REPLACE FUNCTION increment_release_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.distributor_type = 'white_label' AND NEW.subscription_id IS NOT NULL THEN
    UPDATE public.user_distribution_subscriptions
    SET releases_used = releases_used + 1,
        updated_at = now()
    WHERE id = NEW.subscription_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add subscription_id column to music_releases if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'music_releases' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE public.music_releases ADD COLUMN subscription_id UUID REFERENCES public.user_distribution_subscriptions(id);
    ALTER TABLE public.music_releases ADD COLUMN distributor_type TEXT CHECK (distributor_type IN ('affiliate', 'white_label'));
  END IF;
END $$;

CREATE TRIGGER track_release_usage_trigger
  AFTER INSERT ON public.music_releases
  FOR EACH ROW
  EXECUTE FUNCTION increment_release_usage();
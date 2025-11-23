-- Add missing columns to existing tables
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS latest_deliverable_id UUID REFERENCES engineer_deliverables(id);

ALTER TABLE engineer_deliverables ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

ALTER TABLE engineer_earnings 
  ADD COLUMN IF NOT EXISTS base_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE engineer_badges
  ADD COLUMN IF NOT EXISTS badge_type TEXT DEFAULT 'achievement',
  ADD COLUMN IF NOT EXISTS badge_description TEXT,
  ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'award';

ALTER TABLE engineer_streaks
  ADD COLUMN IF NOT EXISTS last_activity_date DATE;

ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS waveform_data JSONB;

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  thread_id UUID
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON direct_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Create music_releases table
CREATE TABLE IF NOT EXISTS music_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_date DATE,
  cover_art_url TEXT,
  streaming_stats JSONB DEFAULT '{}',
  earnings_data JSONB DEFAULT '{}',
  platforms TEXT[] DEFAULT ARRAY['spotify', 'apple_music', 'youtube'],
  status TEXT DEFAULT 'draft',
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE music_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their releases"
  ON music_releases FOR ALL
  USING (auth.uid() = user_id);

-- Create distribution_referrals table
CREATE TABLE IF NOT EXISTS distribution_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  commission_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE distribution_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
  ON distribution_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
  ON distribution_referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Create integration_providers table
CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE,
  provider_type TEXT NOT NULL,
  provider_description TEXT,
  logo_url TEXT,
  auth_url TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active providers"
  ON integration_providers FOR SELECT
  USING (is_active = true);

-- Create user_integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES integration_providers(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their integrations"
  ON user_integrations FOR ALL
  USING (auth.uid() = user_id);

-- Create enterprise_accounts table
CREATE TABLE IF NOT EXISTS enterprise_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  account_type TEXT DEFAULT 'standard',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  monthly_revenue NUMERIC DEFAULT 0,
  features JSONB DEFAULT '{}',
  billing_tier TEXT DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE enterprise_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all accounts"
  ON enterprise_accounts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view their accounts"
  ON enterprise_accounts FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage their accounts"
  ON enterprise_accounts FOR ALL
  USING (auth.uid() = owner_id);

-- Create revenue_streams table
CREATE TABLE IF NOT EXISTS revenue_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stream_type TEXT NOT NULL,
  stream_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  period_start DATE,
  period_end DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their revenue streams"
  ON revenue_streams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create revenue streams"
  ON revenue_streams FOR INSERT
  WITH CHECK (true);

-- Create matches table (AI matchmaking)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score NUMERIC DEFAULT 0,
  match_reason TEXT,
  status TEXT DEFAULT 'pending',
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(artist_id, engineer_id, project_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (auth.uid() = artist_id OR auth.uid() = engineer_id);

CREATE POLICY "System can create matches"
  ON matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their match status"
  ON matches FOR UPDATE
  USING (auth.uid() = artist_id OR auth.uid() = engineer_id);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID,
  platform TEXT NOT NULL,
  share_url TEXT,
  engagement_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their shares"
  ON social_shares FOR ALL
  USING (auth.uid() = user_id);

-- Create growth_milestones table
CREATE TABLE IF NOT EXISTS growth_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 100,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_type TEXT,
  reward_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE growth_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their milestones"
  ON growth_milestones FOR SELECT
  USING (auth.uid() = user_id);

-- Create referrals table (unified referral system)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referral_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending',
  commission_earned NUMERIC DEFAULT 0,
  commission_paid BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Add hybrid_user_preferences table
CREATE TABLE IF NOT EXISTS hybrid_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  primary_role TEXT DEFAULT 'artist',
  show_role_switcher BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE hybrid_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their preferences"
  ON hybrid_user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_users ON direct_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_matches_artist ON matches(artist_id);
CREATE INDEX IF NOT EXISTS idx_matches_engineer ON matches(engineer_id);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_user ON revenue_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_music_releases_user ON music_releases(user_id);
-- ============================================
-- MIXXCOINZ UNIFIED ECONOMY - DATABASE SCHEMA
-- ============================================

-- 1. MIXX WALLETS (replaces/extends user_coins)
-- ============================================
CREATE TABLE public.mixx_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Balances (separated for anti-pay-to-win)
  earned_balance INTEGER DEFAULT 0 CHECK (earned_balance >= 0),
  purchased_balance INTEGER DEFAULT 0 CHECK (purchased_balance >= 0),
  
  -- Lifetime tracking
  total_earned INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  total_gifted INTEGER DEFAULT 0,
  total_received INTEGER DEFAULT 0,
  
  -- Purchase limits (anti-pay-to-win)
  daily_purchased INTEGER DEFAULT 0,
  daily_purchased_reset_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MIXX TRANSACTIONS LEDGER
-- ============================================
CREATE TABLE public.mixx_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARN', 'SPEND', 'PURCHASE', 'GIFT_SENT', 'GIFT_RECEIVED', 'CASHOUT', 'REFUND')),
  source TEXT NOT NULL,
  
  amount INTEGER NOT NULL,
  balance_type TEXT NOT NULL CHECK (balance_type IN ('earned', 'purchased')),
  
  -- Context
  reference_type TEXT,
  reference_id UUID,
  counterparty_id UUID,
  
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MIXX MISSIONS
-- ============================================
CREATE TABLE public.mixx_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('daily', 'weekly', 'achievement', 'community', 'special')),
  icon_name TEXT DEFAULT 'Target',
  
  -- Requirements
  metric_type TEXT NOT NULL,
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  
  -- Rewards
  coinz_reward INTEGER NOT NULL CHECK (coinz_reward > 0),
  xp_reward INTEGER DEFAULT 0,
  
  -- Availability
  role_required TEXT,
  tier_required INTEGER DEFAULT 0,
  repeatable BOOLEAN DEFAULT false,
  reset_interval TEXT CHECK (reset_interval IN ('daily', 'weekly', NULL)),
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MIXX MISSION PROGRESS
-- ============================================
CREATE TABLE public.mixx_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.mixx_missions(id) ON DELETE CASCADE,
  
  current_value INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  
  last_reset_at TIMESTAMPTZ,
  times_completed INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, mission_id)
);

-- 5. MIXX VAULT ITEMS (Lifetime Unlocks)
-- ============================================
CREATE TABLE public.mixx_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('tool', 'skin', 'access', 'sound_engine', 'certification', 'badge', 'perk')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon_name TEXT DEFAULT 'Package',
  image_url TEXT,
  
  -- Pricing
  coinz_price INTEGER NOT NULL CHECK (coinz_price > 0),
  requires_earned_only BOOLEAN DEFAULT false,
  
  -- Availability
  tier_required INTEGER DEFAULT 0,
  role_required TEXT,
  limited_quantity INTEGER,
  quantity_remaining INTEGER,
  
  -- Delivery
  feature_flag_key TEXT,
  asset_url TEXT,
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MIXX VAULT OWNERSHIP
-- ============================================
CREATE TABLE public.mixx_vault_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.mixx_vault_items(id) ON DELETE CASCADE,
  
  coinz_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, item_id)
);

-- 7. CURATOR PROMOTION REQUESTS
-- ============================================
CREATE TABLE public.curator_promotion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  artist_id UUID NOT NULL,
  curator_id UUID NOT NULL,
  
  track_id UUID,
  track_title TEXT NOT NULL,
  track_url TEXT,
  
  payment_currency TEXT NOT NULL CHECK (payment_currency IN ('mixxcoinz', 'usd')),
  payment_amount INTEGER NOT NULL CHECK (payment_amount > 0),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  
  artist_notes TEXT,
  curator_notes TEXT,
  playlist_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 8. MIXX COIN PACKAGES
-- ============================================
CREATE TABLE public.mixx_coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coinz_amount INTEGER NOT NULL CHECK (coinz_amount > 0),
  usd_price NUMERIC(10,2) NOT NULL CHECK (usd_price > 0),
  bonus_percentage INTEGER DEFAULT 0,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.mixx_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixx_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixx_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixx_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixx_vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixx_vault_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curator_promotion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixx_coin_packages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- MIXX_WALLETS: Users can view and manage their own wallet
CREATE POLICY "Users can view own wallet" ON public.mixx_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON public.mixx_wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert wallets" ON public.mixx_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MIXX_TRANSACTIONS: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.mixx_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.mixx_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MIXX_MISSIONS: Everyone can view active missions
CREATE POLICY "Anyone can view active missions" ON public.mixx_missions
  FOR SELECT USING (is_active = true);

-- MIXX_MISSION_PROGRESS: Users can manage their own progress
CREATE POLICY "Users can view own mission progress" ON public.mixx_mission_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mission progress" ON public.mixx_mission_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mission progress" ON public.mixx_mission_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- MIXX_VAULT_ITEMS: Everyone can view active items
CREATE POLICY "Anyone can view active vault items" ON public.mixx_vault_items
  FOR SELECT USING (is_active = true);

-- MIXX_VAULT_OWNERSHIP: Users can view their own ownership
CREATE POLICY "Users can view own vault ownership" ON public.mixx_vault_ownership
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault ownership" ON public.mixx_vault_ownership
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CURATOR_PROMOTION_REQUESTS: Artists and curators can view their own requests
CREATE POLICY "Artists can view own promotion requests" ON public.curator_promotion_requests
  FOR SELECT USING (auth.uid() = artist_id OR auth.uid() = curator_id);

CREATE POLICY "Artists can create promotion requests" ON public.curator_promotion_requests
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Curators can update requests" ON public.curator_promotion_requests
  FOR UPDATE USING (auth.uid() = curator_id OR auth.uid() = artist_id);

-- MIXX_COIN_PACKAGES: Everyone can view active packages
CREATE POLICY "Anyone can view active coin packages" ON public.mixx_coin_packages
  FOR SELECT USING (is_active = true);

-- ============================================
-- SEED STARTER MISSIONS
-- ============================================
INSERT INTO public.mixx_missions (name, description, category, metric_type, target_value, coinz_reward, xp_reward, repeatable, reset_interval, icon_name, sort_order) VALUES
('Welcome to MixxClub', 'Complete your profile to get started', 'achievement', 'profile_completed', 1, 500, 100, false, NULL, 'Sparkles', 1),
('First Feedback Given', 'Give constructive feedback on a track', 'achievement', 'feedback_given', 1, 100, 25, false, NULL, 'MessageCircle', 2),
('Daily Check-In', 'Log in to MixxClub', 'daily', 'daily_login', 1, 10, 5, true, 'daily', 'Calendar', 3),
('3-Day Streak', 'Log in 3 days in a row', 'daily', 'login_streak', 3, 50, 25, true, 'daily', 'Flame', 4),
('7-Day Streak', 'Log in 7 days in a row', 'weekly', 'login_streak', 7, 200, 75, true, 'weekly', 'Zap', 5),
('Share the Vibe', 'Share a track with the community', 'weekly', 'tracks_shared', 1, 25, 10, true, 'weekly', 'Share2', 6),
('Premiere Voter', 'Vote on 5 premieres this week', 'weekly', 'premiere_votes', 5, 75, 30, true, 'weekly', 'Vote', 7),
('Session Starter', 'Complete your first collaboration session', 'achievement', 'sessions_completed', 1, 500, 150, false, NULL, 'Users', 8),
('Referral Champion', 'Invite a friend who signs up', 'achievement', 'referrals', 1, 250, 50, true, NULL, 'UserPlus', 9),
('Community Contributor', 'Earn 1000 XP total', 'achievement', 'total_xp', 1000, 300, 100, false, NULL, 'Award', 10);

-- ============================================
-- SEED COIN PACKAGES
-- ============================================
INSERT INTO public.mixx_coin_packages (name, coinz_amount, usd_price, bonus_percentage, sort_order) VALUES
('Starter Pack', 100, 0.99, 0, 1),
('Vibe Pack', 500, 4.99, 0, 2),
('Producer Pack', 1200, 9.99, 20, 3),
('Studio Pack', 3000, 24.99, 20, 4),
('Platinum Pack', 7500, 49.99, 50, 5);

-- ============================================
-- SEED VAULT ITEMS
-- ============================================
INSERT INTO public.mixx_vault_items (name, description, category, rarity, coinz_price, requires_earned_only, icon_name, sort_order) VALUES
('Early Adopter Badge', 'Show everyone you were here from the start', 'badge', 'rare', 500, true, 'Badge', 1),
('Pro Profile Frame', 'Golden frame around your profile picture', 'skin', 'common', 250, false, 'Frame', 2),
('Priority Queue Access', 'Skip to the front of session matching', 'perk', 'epic', 2000, false, 'FastForward', 3),
('Exclusive Sound Pack Vol.1', 'Curated samples from top producers', 'sound_engine', 'rare', 1500, false, 'Music', 4),
('Certified Mixer Badge', 'Proves you passed the mixing certification', 'certification', 'legendary', 5000, true, 'Award', 5),
('Dark Mode Plus', 'Unlock exclusive dark theme variants', 'skin', 'common', 300, false, 'Moon', 6),
('VIP Premiere Access', 'Early access to all premieres', 'access', 'epic', 3000, false, 'Star', 7);

-- ============================================
-- ADD PLATFORM FREEDOM UNLOCKABLE
-- ============================================
INSERT INTO public.unlockables (
  name, 
  description, 
  unlock_type, 
  metric_type, 
  target_value, 
  reward_description,
  icon_name,
  tier,
  is_unlocked
) VALUES (
  'Platform Freedom',
  'The community collectively eliminates subscription tiers. MixxClub becomes transaction-only.',
  'community',
  'user_count',
  10000,
  'Subscription tiers eliminated. All features unlocked. Platform runs on transaction fees only.',
  'Unlock',
  5,
  false
);

-- ============================================
-- HELPER FUNCTION: Get or Create Wallet
-- ============================================
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(p_user_id UUID)
RETURNS public.mixx_wallets AS $$
DECLARE
  wallet public.mixx_wallets;
BEGIN
  SELECT * INTO wallet FROM public.mixx_wallets WHERE user_id = p_user_id;
  
  IF wallet IS NULL THEN
    INSERT INTO public.mixx_wallets (user_id)
    VALUES (p_user_id)
    RETURNING * INTO wallet;
  END IF;
  
  RETURN wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Update wallet timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mixx_wallets_timestamp
  BEFORE UPDATE ON public.mixx_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_timestamp();

-- ============================================
-- TRIGGER: Reset daily purchase limit
-- ============================================
CREATE OR REPLACE FUNCTION public.check_and_reset_daily_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.daily_purchased_reset_at < CURRENT_DATE THEN
    NEW.daily_purchased := 0;
    NEW.daily_purchased_reset_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reset_daily_purchase_limit
  BEFORE UPDATE ON public.mixx_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_reset_daily_limit();
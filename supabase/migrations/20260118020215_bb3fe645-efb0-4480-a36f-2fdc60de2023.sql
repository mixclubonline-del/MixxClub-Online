-- Create partners table for affiliate/reseller program
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  commission_rate NUMERIC DEFAULT 10,
  affiliate_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_commissions NUMERIC DEFAULT 0,
  pending_commissions NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upgraded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_partners_user_id ON public.partners(user_id);
CREATE INDEX idx_partners_affiliate_code ON public.partners(affiliate_code);
CREATE INDEX idx_partners_tier ON public.partners(tier);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own partner record" 
  ON public.partners FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own partner record" 
  ON public.partners FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner record" 
  ON public.partners FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to auto-update tier based on referral count
CREATE OR REPLACE FUNCTION public.update_partner_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine new tier based on total_referrals
  IF NEW.total_referrals >= 200 THEN
    NEW.tier := 'platinum';
    NEW.commission_rate := 30;
  ELSIF NEW.total_referrals >= 50 THEN
    NEW.tier := 'gold';
    NEW.commission_rate := 20;
  ELSIF NEW.total_referrals >= 10 THEN
    NEW.tier := 'silver';
    NEW.commission_rate := 15;
  ELSE
    NEW.tier := 'bronze';
    NEW.commission_rate := 10;
  END IF;
  
  -- Track upgrade time if tier changed
  IF OLD.tier IS DISTINCT FROM NEW.tier THEN
    NEW.upgraded_at := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto tier updates
CREATE TRIGGER trigger_update_partner_tier
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_partner_tier();

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'MIXX-';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
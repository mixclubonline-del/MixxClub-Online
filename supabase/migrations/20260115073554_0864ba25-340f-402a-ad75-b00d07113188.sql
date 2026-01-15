-- Create addon_services table for high-margin upsells
CREATE TABLE IF NOT EXISTS addon_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  applicable_to TEXT[] DEFAULT '{}',
  is_percentage BOOLEAN DEFAULT false,
  percentage_value NUMERIC,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE addon_services ENABLE ROW LEVEL SECURITY;

-- Policy for public read
CREATE POLICY "Anyone can view active addon services" ON addon_services
  FOR SELECT USING (is_active = true);

-- Create subscription_plans table if not exists
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL,
  price_yearly NUMERIC,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policy for public read
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Create engineer_payouts table if not exists
CREATE TABLE IF NOT EXISTS engineer_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  project_id UUID REFERENCES projects(id),
  gross_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending',
  payout_method TEXT DEFAULT 'stripe_connect',
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE engineer_payouts ENABLE ROW LEVEL SECURITY;

-- Policy for engineers to view their payouts
CREATE POLICY "Engineers can view their own payouts" ON engineer_payouts
  FOR SELECT USING (auth.uid() = engineer_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_engineer_payouts_engineer_id ON engineer_payouts(engineer_id);
CREATE INDEX IF NOT EXISTS idx_engineer_payouts_status ON engineer_payouts(status);
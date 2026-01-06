-- Create distribution_packages table for storing distribution tiers
CREATE TABLE public.distribution_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  package_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'annual',
  partner_name TEXT NOT NULL,
  partner_affiliate_url TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  platforms_count INTEGER DEFAULT 150,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.distribution_packages ENABLE ROW LEVEL SECURITY;

-- Public read access (packages are visible to everyone)
CREATE POLICY "Distribution packages are publicly readable"
ON public.distribution_packages
FOR SELECT
USING (true);

-- Insert initial affiliate packages
INSERT INTO public.distribution_packages (package_name, package_description, price, partner_name, partner_affiliate_url, features, platforms_count, is_featured, sort_order) VALUES
(
  'Basic',
  'Perfect for independent artists getting started',
  19.99,
  'DistroKid',
  'https://distrokid.com/vip/mixclub',
  '["Unlimited releases", "All major platforms", "Keep 100% royalties", "Release in 24-48 hours", "Spotify verified checkmark"]'::jsonb,
  150,
  false,
  1
),
(
  'Pro',
  'For serious artists ready to monetize everywhere',
  39.99,
  'TuneCore',
  'https://tunecore.com/?ref=mixclub',
  '["Unlimited releases", "All major platforms", "YouTube Content ID", "Publishing administration", "Detailed analytics", "Release scheduling"]'::jsonb,
  150,
  true,
  2
),
(
  'Premium',
  'Full-service distribution with sync licensing',
  99.99,
  'CD Baby',
  'https://cdbaby.com/?ref=mixclub',
  '["Unlimited releases", "All major platforms", "Sync licensing opportunities", "YouTube monetization", "Physical distribution", "Dedicated support", "Cover song licensing"]'::jsonb,
  150,
  false,
  3
);
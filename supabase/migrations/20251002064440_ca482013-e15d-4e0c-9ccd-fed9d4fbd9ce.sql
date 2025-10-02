-- Phase 1: Financial Optimization - Distribution Packages & Add-On Services (Fixed)

-- Drop existing tables if they exist to ensure clean slate
DROP TABLE IF EXISTS public.add_on_purchases CASCADE;
DROP TABLE IF EXISTS public.user_distribution_subscriptions CASCADE;
DROP TABLE IF EXISTS public.add_on_services CASCADE;
DROP TABLE IF EXISTS public.distribution_packages CASCADE;

-- Create distribution_packages table
CREATE TABLE public.distribution_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  package_description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT NOT NULL DEFAULT 'annual',
  releases_per_year INTEGER NOT NULL,
  stores_included JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_distribution_subscriptions table
CREATE TABLE public.user_distribution_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.distribution_packages(id) ON DELETE RESTRICT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  releases_used INTEGER DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create add_on_services table
CREATE TABLE public.add_on_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  service_description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  processing_time_minutes INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create add_on_purchases table
CREATE TABLE public.add_on_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  add_on_id UUID NOT NULL REFERENCES public.add_on_services(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add job posting fee fields
ALTER TABLE public.job_postings 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS posting_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free';

-- Enable RLS
ALTER TABLE public.distribution_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_distribution_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_on_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_on_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active distribution packages"
  ON public.distribution_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage distribution packages"
  ON public.distribution_packages FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own distribution subscriptions"
  ON public.user_distribution_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create distribution subscriptions"
  ON public.user_distribution_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Everyone can view active add-on services"
  ON public.add_on_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage add-on services"
  ON public.add_on_services FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own add-on purchases"
  ON public.add_on_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own add-on purchases"
  ON public.add_on_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert default distribution packages
INSERT INTO public.distribution_packages (package_name, package_description, price, billing_cycle, releases_per_year, stores_included, features, display_order) VALUES
('Basic', 'Perfect for independent artists starting out', 19.99, 'annual', 5, 
  '["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Deezer"]'::jsonb,
  '["5 releases per year", "All major streaming platforms", "Keep 100% of royalties", "Basic analytics", "Free ISRC codes"]'::jsonb, 1),
('Pro', 'For serious artists releasing regularly', 39.99, 'annual', 20,
  '["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Deezer", "Tidal", "Pandora", "SoundCloud"]'::jsonb,
  '["20 releases per year", "All streaming platforms", "Keep 100% of royalties", "Advanced analytics", "Free ISRC & UPC codes", "Pre-save campaigns", "Split payments"]'::jsonb, 2),
('Unlimited', 'For labels and power users', 99.99, 'annual', -1,
  '["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Deezer", "Tidal", "Pandora", "SoundCloud", "Instagram", "TikTok", "Beatport"]'::jsonb,
  '["Unlimited releases", "All platforms including DJ stores", "Keep 100% of royalties", "Premium analytics & insights", "Free codes", "Priority distribution", "Advanced pre-save", "Revenue splitting", "Label management tools", "Priority support"]'::jsonb, 3);

-- Insert default add-on services
INSERT INTO public.add_on_services (service_name, service_type, service_description, price, processing_time_minutes, features, display_order) VALUES
('Vocal Tuning', 'audio_enhancement', 'Professional vocal pitch correction and tuning', 15.00, 60,
  '["Natural-sounding pitch correction", "Preserve vocal character", "Fix timing issues", "Professional-grade results"]'::jsonb, 1),
('Stem Separation', 'audio_processing', 'AI-powered stem separation into vocals, drums, bass, and other', 25.00, 30,
  '["High-quality AI separation", "Vocals, drums, bass, other", "Perfect for remixing", "Instant delivery"]'::jsonb, 2),
('Priority Processing', 'service_upgrade', 'Move your track to the front of the queue', 10.00, 0,
  '["Skip the line", "24-hour turnaround", "Same-day processing", "Premium support"]'::jsonb, 3),
('Reference Track Analysis', 'analysis', 'Compare your track to a professional reference', 20.00, 45,
  '["Detailed frequency analysis", "Loudness comparison", "Stereo width analysis", "Actionable recommendations"]'::jsonb, 4);

-- Create function to check distribution access
CREATE OR REPLACE FUNCTION public.has_distribution_access(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_distribution_subscriptions uds
    JOIN public.distribution_packages dp ON uds.package_id = dp.id
    WHERE uds.user_id = $1
      AND uds.status = 'active'
      AND (uds.current_period_end IS NULL OR uds.current_period_end > now())
      AND (dp.releases_per_year = -1 OR uds.releases_used < dp.releases_per_year)
  );
$$;
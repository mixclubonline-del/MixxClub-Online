-- Create mixing packages table
CREATE TABLE public.mixing_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  features JSONB DEFAULT '[]'::jsonb,
  track_limit INTEGER, -- -1 for unlimited, NULL for one-time purchase
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mixing_packages ENABLE ROW LEVEL SECURITY;

-- Create policies for mixing packages
CREATE POLICY "Mixing packages are viewable by everyone" 
ON public.mixing_packages 
FOR SELECT 
USING (is_active = true);

-- Create user mixing subscriptions table
CREATE TABLE public.user_mixing_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES public.mixing_packages(id),
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tracks_used INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_mixing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user mixing subscriptions
CREATE POLICY "Users can view their own mixing subscriptions" 
ON public.user_mixing_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mixing subscriptions" 
ON public.user_mixing_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to check mixing access
CREATE OR REPLACE FUNCTION public.has_mixing_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_mixing_subscriptions ums
    JOIN public.mixing_packages mp ON ums.package_id = mp.id
    WHERE ums.user_id = $1
      AND ums.status = 'active'
      AND (ums.expires_at IS NULL OR ums.expires_at > now())
      AND (mp.track_limit = -1 OR ums.tracks_used < mp.track_limit)
  );
$$;

-- Add update triggers
CREATE TRIGGER update_mixing_packages_updated_at
BEFORE UPDATE ON public.mixing_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_mixing_subscriptions_updated_at
BEFORE UPDATE ON public.user_mixing_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default mixing packages
INSERT INTO public.mixing_packages (name, description, price, features, track_limit) VALUES
('Basic Mix', 'Professional mixing for single tracks', 75.00, '["Professional EQ & Compression", "Stereo Enhancement", "Basic Mastering", "2 Revisions Included", "48-hour Delivery"]', 1),
('Mix Package', 'Complete mixing solution for your project', 199.00, '["Professional Mixing", "Advanced Processing", "Stem Delivery", "Unlimited Revisions", "24-hour Priority Delivery", "Direct Engineer Communication"]', 5),
('Studio Pro', 'Unlimited mixing with premium features', 499.00, '["Unlimited Track Mixing", "Premium Plugin Suite", "Advanced Stem Processing", "Real-time Collaboration", "Priority Support", "Custom Mix Templates", "Instant Delivery"]', -1);
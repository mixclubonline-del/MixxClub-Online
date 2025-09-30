-- Create mastering packages table
CREATE TABLE public.mastering_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  features JSONB DEFAULT '[]'::jsonb,
  track_limit INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user mastering subscriptions table
CREATE TABLE public.user_mastering_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES public.mastering_packages(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tracks_used INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mastering_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mastering_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for mastering packages
CREATE POLICY "Mastering packages are viewable by everyone" 
ON public.mastering_packages 
FOR SELECT 
USING (is_active = true);

-- RLS policies for user subscriptions
CREATE POLICY "Users can view their own mastering subscriptions" 
ON public.user_mastering_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mastering subscriptions" 
ON public.user_mastering_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mastering subscriptions" 
ON public.user_mastering_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert some default mastering packages
INSERT INTO public.mastering_packages (name, description, price, features, track_limit) VALUES
('Starter', 'Perfect for single tracks and demos', 9.99, '["AI Mastering", "Platform Optimization", "Basic Analysis", "1 Revision"]', 1),
('Pro', 'For independent artists and small projects', 29.99, '["AI Mastering", "Platform Optimization", "Advanced Analysis", "Unlimited Revisions", "Stem Processing", "Custom Presets"]', 5),
('Studio', 'For professional producers and labels', 99.99, '["AI Mastering", "Platform Optimization", "Advanced Analysis", "Unlimited Revisions", "Stem Processing", "Custom Presets", "Priority Processing", "A&R Feedback"]', 25),
('Unlimited', 'For high-volume producers and labels', 299.99, '["AI Mastering", "Platform Optimization", "Advanced Analysis", "Unlimited Revisions", "Stem Processing", "Custom Presets", "Priority Processing", "A&R Feedback", "API Access", "White Label"]', -1);

-- Create function to check mastering access
CREATE OR REPLACE FUNCTION public.has_mastering_access(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_mastering_subscriptions ums
    JOIN public.mastering_packages mp ON ums.package_id = mp.id
    WHERE ums.user_id = $1
      AND ums.status = 'active'
      AND (ums.expires_at IS NULL OR ums.expires_at > now())
      AND (mp.track_limit = -1 OR ums.tracks_used < mp.track_limit)
  );
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_mastering_packages_updated_at
BEFORE UPDATE ON public.mastering_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_mastering_subscriptions_updated_at
BEFORE UPDATE ON public.user_mastering_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
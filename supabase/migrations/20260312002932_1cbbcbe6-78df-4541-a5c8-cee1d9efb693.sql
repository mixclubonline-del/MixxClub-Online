
-- Platform config table for branding and admin settings
CREATE TABLE IF NOT EXISTS public.platform_config (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read platform config (brand settings are public)
CREATE POLICY "Anyone can read platform config"
  ON public.platform_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify platform config
CREATE POLICY "Admins can manage platform config"
  ON public.platform_config
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default values
INSERT INTO public.platform_config (key, value) VALUES
  ('launch_mode', '"live"'),
  ('brand_name', '"Mixx Club"'),
  ('brand_primary_color', '"280 100% 65%"'),
  ('brand_accent_color', '"320 90% 60%"')
ON CONFLICT (key) DO NOTHING;

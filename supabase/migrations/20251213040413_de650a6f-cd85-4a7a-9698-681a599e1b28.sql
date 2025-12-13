-- Create brand-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create user-uploads storage bucket (private per-user)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Brand assets table for tracking generated brand assets
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'video', 'background', 'image')),
  name TEXT NOT NULL,
  prompt_used TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT false,
  asset_context TEXT CHECK (asset_context IN ('hero', 'navigation', 'favicon', 'splash', 'background', 'general')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brand settings for active asset configuration
CREATE TABLE IF NOT EXISTS public.brand_settings (
  id TEXT PRIMARY KEY,
  active_asset_id UUID REFERENCES public.brand_assets(id) ON DELETE SET NULL,
  setting_value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_assets
CREATE POLICY "Everyone can view brand assets"
ON public.brand_assets FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create brand assets"
ON public.brand_assets FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all brand assets"
ON public.brand_assets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own brand assets"
ON public.brand_assets FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own brand assets"
ON public.brand_assets FOR DELETE
USING (auth.uid() = created_by);

-- RLS policies for brand_settings
CREATE POLICY "Everyone can view brand settings"
ON public.brand_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage brand settings"
ON public.brand_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for brand-assets bucket
CREATE POLICY "Anyone can read brand assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete brand assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'brand-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for user-uploads bucket (private per-user)
CREATE POLICY "Users can read their own uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert default brand settings
INSERT INTO public.brand_settings (id, setting_value) VALUES
  ('primary_logo', '{"context": "navigation"}'::jsonb),
  ('hero_logo', '{"context": "hero"}'::jsonb),
  ('hero_video', '{"context": "background"}'::jsonb),
  ('favicon', '{"context": "favicon"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
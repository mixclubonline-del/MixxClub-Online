-- Create marketing_campaigns table for storing generated campaigns
CREATE TABLE public.marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  campaign_type text CHECK (campaign_type IN ('launch', 'feature', 'seasonal', 'awareness', 'promotional')),
  target_audience text CHECK (target_audience IN ('artists', 'engineers', 'both', 'fans')),
  tone text CHECK (tone IN ('hype', 'professional', 'authentic', 'aspirational', 'edgy')),
  key_message text,
  generated_assets jsonb DEFAULT '[]'::jsonb,
  generated_copy jsonb DEFAULT '{}'::jsonb,
  social_posts jsonb DEFAULT '{}'::jsonb,
  ad_variants jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'complete', 'exported', 'deployed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can manage their own campaigns, admins can see all
CREATE POLICY "Users can view own campaigns" ON public.marketing_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns" ON public.marketing_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.marketing_campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.marketing_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for viewing all campaigns
CREATE POLICY "Admins can view all campaigns" ON public.marketing_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
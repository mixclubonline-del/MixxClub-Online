-- Create effect_presets table for saving and loading effect settings
CREATE TABLE IF NOT EXISTS public.effect_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  effect_type TEXT NOT NULL CHECK (effect_type IN ('eq', 'compressor', 'reverb', 'delay', 'limiter', 'saturator')),
  preset_name TEXT NOT NULL,
  parameters JSONB NOT NULL,
  is_factory BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.effect_presets ENABLE ROW LEVEL SECURITY;

-- Users can view their own presets and public/factory presets
CREATE POLICY "Users can view their own presets and public presets"
  ON public.effect_presets
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_public = true 
    OR is_factory = true
  );

-- Users can create their own presets
CREATE POLICY "Users can create their own presets"
  ON public.effect_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own presets
CREATE POLICY "Users can update their own presets"
  ON public.effect_presets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own presets
CREATE POLICY "Users can delete their own presets"
  ON public.effect_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_effect_presets_user_id ON public.effect_presets(user_id);
CREATE INDEX idx_effect_presets_effect_type ON public.effect_presets(effect_type);
CREATE INDEX idx_effect_presets_is_public ON public.effect_presets(is_public);

-- Insert some factory presets
INSERT INTO public.effect_presets (user_id, effect_type, preset_name, parameters, is_factory, is_public, description)
SELECT 
  (SELECT id FROM auth.users LIMIT 1), -- Use first user as factory owner
  'eq',
  'Bright Vocals',
  '{"lowGain": 0.4, "lowFreq": 0.2, "lowMidGain": 0.5, "lowMidFreq": 0.4, "highMidGain": 0.6, "highMidFreq": 0.7, "highGain": 0.7, "highFreq": 0.85}'::jsonb,
  true,
  true,
  'Adds brightness and presence to vocals'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.effect_presets (user_id, effect_type, preset_name, parameters, is_factory, is_public, description)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'compressor',
  'Punchy Drums',
  '{"threshold": 0.5, "ratio": 0.5, "attack": 0.1, "release": 0.3, "makeup": 0.6, "knee": 0.4}'::jsonb,
  true,
  true,
  'Adds punch and consistency to drum tracks'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.effect_presets (user_id, effect_type, preset_name, parameters, is_factory, is_public, description)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'reverb',
  'Large Hall',
  '{"mix": 0.4, "decay": 0.8, "damping": 0.4, "size": 0.9, "predelay": 0.3}'::jsonb,
  true,
  true,
  'Spacious concert hall reverb'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
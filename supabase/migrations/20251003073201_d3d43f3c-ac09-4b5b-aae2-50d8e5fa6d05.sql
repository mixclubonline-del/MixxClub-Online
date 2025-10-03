-- Phase 2: Dual-Role System Database Setup

-- 1. Create hybrid_user_preferences table
CREATE TABLE IF NOT EXISTS public.hybrid_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  primary_role TEXT NOT NULL CHECK (primary_role IN ('client', 'engineer')),
  default_dashboard TEXT NOT NULL CHECK (default_dashboard IN ('artist', 'engineer', 'unified')) DEFAULT 'unified',
  show_role_switcher BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Update onboarding_profiles to support hybrid users
ALTER TABLE public.onboarding_profiles
  ADD COLUMN IF NOT EXISTS is_hybrid_user BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS secondary_user_type TEXT CHECK (secondary_user_type IN ('client', 'engineer', NULL));

-- 3. Enable RLS on hybrid_user_preferences
ALTER TABLE public.hybrid_user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for hybrid_user_preferences
CREATE POLICY "Users manage own hybrid preferences"
  ON public.hybrid_user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Add updated_at trigger for hybrid_user_preferences
CREATE TRIGGER update_hybrid_user_preferences_updated_at
  BEFORE UPDATE ON public.hybrid_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
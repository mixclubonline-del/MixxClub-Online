-- Fix search path for update function (proper order)
DROP TRIGGER IF EXISTS update_matching_preferences_updated_at ON public.user_matching_preferences;
DROP FUNCTION IF EXISTS public.update_matching_preferences_updated_at();

CREATE OR REPLACE FUNCTION public.update_matching_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER update_matching_preferences_updated_at
  BEFORE UPDATE ON public.user_matching_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_matching_preferences_updated_at();
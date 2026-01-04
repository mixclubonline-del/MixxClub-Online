-- Fix function search path for security
ALTER FUNCTION public.update_follow_counts() SET search_path = public;
ALTER FUNCTION public.increment_profile_views() SET search_path = public;
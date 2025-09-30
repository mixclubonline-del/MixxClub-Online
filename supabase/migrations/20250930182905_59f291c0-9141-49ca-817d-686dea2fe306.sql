-- Fix security definer view warning
-- Drop the security definer view and replace with regular view
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  role,
  level,
  points,
  badges,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Fix remaining functions with missing search_path
-- Get all functions that need fixing
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_battle_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.battles 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.battle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.battles 
    SET votes_count = votes_count - 1 
    WHERE id = OLD.battle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_battler_score(ltbr_rank integer, versetracker_rank integer, social_score real, platform_votes integer)
RETURNS real
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  ltbr_score REAL := 0;
  verse_score REAL := 0;
  social_weight REAL := 0.2;
  platform_weight REAL := 0.1;
  total_score REAL := 0;
BEGIN
  IF ltbr_rank IS NOT NULL AND ltbr_rank > 0 THEN
    ltbr_score := (101 - LEAST(ltbr_rank, 100)) * 0.4;
  END IF;
  
  IF versetracker_rank IS NOT NULL AND versetracker_rank > 0 THEN
    verse_score := (101 - LEAST(versetracker_rank, 100)) * 0.3;
  END IF;
  
  IF social_score IS NOT NULL THEN
    total_score := total_score + (social_score * 10 * social_weight);
  END IF;
  
  IF platform_votes IS NOT NULL THEN
    total_score := total_score + (LEAST(platform_votes, 1000) / 100 * platform_weight);
  END IF;
  
  total_score := ltbr_score + verse_score + total_score;
  
  RETURN GREATEST(0, total_score);
END;
$function$;
-- Fix function search path for existing functions that might have been flagged
-- Update check_user_credits function
CREATE OR REPLACE FUNCTION public.check_user_credits(p_user_id uuid, p_required_credits integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT credits_balance INTO v_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, credits_balance)
    VALUES (p_user_id, 0)
    RETURNING credits_balance INTO v_balance;
  END IF;
  
  RETURN v_balance >= p_required_credits;
END;
$function$;
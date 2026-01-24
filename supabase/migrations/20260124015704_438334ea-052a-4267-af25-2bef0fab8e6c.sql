-- Fix the function search_path for the new trigger
CREATE OR REPLACE FUNCTION public.update_prime_brand_assets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
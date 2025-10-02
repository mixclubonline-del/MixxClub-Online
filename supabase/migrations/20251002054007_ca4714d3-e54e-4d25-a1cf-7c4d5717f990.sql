-- Fix function search_path warnings by setting search_path to public

CREATE OR REPLACE FUNCTION update_calendar_event_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.event_date < now() THEN
    NEW.status := 'overdue';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public;

CREATE OR REPLACE FUNCTION increment_release_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.distributor_type = 'white_label' AND NEW.subscription_id IS NOT NULL THEN
    UPDATE public.user_distribution_subscriptions
    SET releases_used = releases_used + 1,
        updated_at = now()
    WHERE id = NEW.subscription_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
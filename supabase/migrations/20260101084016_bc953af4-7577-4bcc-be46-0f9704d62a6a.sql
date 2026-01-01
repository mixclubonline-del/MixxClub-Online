-- Drop triggers first
DROP TRIGGER IF EXISTS update_client_notes_count ON public.crm_notes;
DROP TRIGGER IF EXISTS update_client_deals_count ON public.crm_deals;
DROP TRIGGER IF EXISTS update_client_last_interaction ON public.crm_interactions;

-- Drop and recreate function with proper search path
DROP FUNCTION IF EXISTS public.update_crm_client_stats();

CREATE OR REPLACE FUNCTION public.update_crm_client_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_TABLE_NAME = 'crm_notes' THEN
    UPDATE crm_clients SET 
      notes_count = (SELECT COUNT(*) FROM crm_notes WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)),
      updated_at = now()
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  ELSIF TG_TABLE_NAME = 'crm_deals' THEN
    UPDATE crm_clients SET 
      deals_count = (SELECT COUNT(*) FROM crm_deals WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)),
      total_value = (SELECT COALESCE(SUM(value), 0) FROM crm_deals WHERE client_id = COALESCE(NEW.client_id, OLD.client_id) AND stage = 'won'),
      updated_at = now()
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  ELSIF TG_TABLE_NAME = 'crm_interactions' THEN
    UPDATE crm_clients SET 
      last_interaction_at = (SELECT MAX(occurred_at) FROM crm_interactions WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)),
      updated_at = now()
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_client_notes_count
  AFTER INSERT OR DELETE ON public.crm_notes
  FOR EACH ROW EXECUTE FUNCTION update_crm_client_stats();

CREATE TRIGGER update_client_deals_count
  AFTER INSERT OR UPDATE OR DELETE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION update_crm_client_stats();

CREATE TRIGGER update_client_last_interaction
  AFTER INSERT ON public.crm_interactions
  FOR EACH ROW EXECUTE FUNCTION update_crm_client_stats();
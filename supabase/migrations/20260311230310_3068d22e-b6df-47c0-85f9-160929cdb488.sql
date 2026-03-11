
-- 1. Trigger: When a collaborative project's progress reaches a milestone (status changes to 'completed' or 'released')
CREATE OR REPLACE FUNCTION public.notify_project_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_partnership RECORD;
  v_project_title TEXT;
BEGIN
  -- Only fire when status changes to completed or released
  IF (NEW.status IN ('completed', 'released')) AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    v_project_title := NEW.title;
    
    -- Get partnership to notify both partners
    SELECT artist_id, engineer_id, producer_id 
    INTO v_partnership
    FROM partnerships 
    WHERE id = NEW.partnership_id;

    IF v_partnership.artist_id IS NOT NULL THEN
      PERFORM create_notification(
        v_partnership.artist_id,
        'milestone_reached',
        '🎯 Project Milestone Hit',
        'Project "' || v_project_title || '" is now ' || NEW.status || '!',
        '/artist-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.engineer_id IS NOT NULL THEN
      PERFORM create_notification(
        v_partnership.engineer_id,
        'milestone_reached',
        '🎯 Project Milestone Hit',
        'Project "' || v_project_title || '" is now ' || NEW.status || '!',
        '/engineer-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.producer_id IS NOT NULL THEN
      PERFORM create_notification(
        v_partnership.producer_id,
        'milestone_reached',
        '🎯 Project Milestone Hit',
        'Project "' || v_project_title || '" is now ' || NEW.status || '!',
        '/producer-crm?tab=earnings'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_project_milestone
  AFTER UPDATE ON public.collaborative_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_project_milestone();

-- 2. Trigger: When a revenue split status changes to 'completed'
CREATE OR REPLACE FUNCTION public.notify_revenue_split_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_partnership RECORD;
  v_amount_text TEXT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    v_amount_text := '$' || ROUND(NEW.total_amount::numeric, 2)::TEXT;

    SELECT artist_id, engineer_id, producer_id 
    INTO v_partnership
    FROM partnerships 
    WHERE id = NEW.partnership_id;

    IF v_partnership.artist_id IS NOT NULL AND NEW.artist_amount > 0 THEN
      PERFORM create_notification(
        v_partnership.artist_id,
        'payment_received',
        '💰 Revenue Split Completed',
        'You received $' || ROUND(NEW.artist_amount::numeric, 2)::TEXT || ' from a ' || v_amount_text || ' split.',
        '/artist-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.engineer_id IS NOT NULL AND NEW.engineer_amount > 0 THEN
      PERFORM create_notification(
        v_partnership.engineer_id,
        'payment_received',
        '💰 Revenue Split Completed',
        'You received $' || ROUND(NEW.engineer_amount::numeric, 2)::TEXT || ' from a ' || v_amount_text || ' split.',
        '/engineer-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.producer_id IS NOT NULL THEN
      PERFORM create_notification(
        v_partnership.producer_id,
        'payment_received',
        '💰 Revenue Split Completed',
        'Revenue split of ' || v_amount_text || ' has been completed.',
        '/producer-crm?tab=earnings'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_revenue_split_completed
  AFTER UPDATE ON public.revenue_splits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_revenue_split_completed();

-- 3. Trigger: When partnership health drops below 60
CREATE OR REPLACE FUNCTION public.notify_partnership_health_warning()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_partnership RECORD;
  v_severity TEXT;
  v_notification_type TEXT;
BEGIN
  -- Only fire when health score drops below 60 (and wasn't already below)
  IF NEW.health_score IS NOT NULL AND NEW.health_score < 60 
     AND (OLD.health_score IS NULL OR OLD.health_score >= 60) THEN

    IF NEW.health_score < 30 THEN
      v_severity := 'Critical';
      v_notification_type := 'health_critical';
    ELSE
      v_severity := 'Warning';
      v_notification_type := 'health_warning';
    END IF;

    SELECT artist_id, engineer_id, producer_id 
    INTO v_partnership
    FROM partnerships 
    WHERE id = NEW.partnership_id;

    IF v_partnership.artist_id IS NOT NULL THEN
      PERFORM create_notification(
        v_partnership.artist_id,
        v_notification_type,
        '⚠️ Partnership Health ' || v_severity,
        'Partnership health score dropped to ' || NEW.health_score || '/100. Review activity and payments.',
        '/artist-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.engineer_id IS NOT NULL THEN
      PERFORM create_notification(
        v_partnership.engineer_id,
        v_notification_type,
        '⚠️ Partnership Health ' || v_severity,
        'Partnership health score dropped to ' || NEW.health_score || '/100. Review activity and payments.',
        '/engineer-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.producer_id IS NOT NULL THEN
      PERFORM create_notification(
        v_partnership.producer_id,
        v_notification_type,
        '⚠️ Partnership Health ' || v_severity,
        'Partnership health score dropped to ' || NEW.health_score || '/100. Review activity and payments.',
        '/producer-crm?tab=earnings'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_partnership_health_warning
  AFTER UPDATE ON public.partnership_health
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_partnership_health_warning();

-- Enable realtime for partnership notification tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.partnership_health;
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_splits;


-- Email send logging table
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs" ON public.email_send_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX idx_email_send_log_template ON public.email_send_log(template_name);

-- Preference-aware notification creation function
CREATE OR REPLACE FUNCTION public.create_notification_checked(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id UUID;
  v_in_app_enabled BOOLEAN := true;
  v_category TEXT;
BEGIN
  -- Map notification type to preference category
  v_category := CASE
    WHEN p_type IN ('milestone_reached', 'project_update') THEN 'projects'
    WHEN p_type IN ('payment_received', 'payment') THEN 'payments'
    WHEN p_type IN ('collaboration_invite', 'session_invite', 'follow') THEN 'partnerships'
    WHEN p_type IN ('message') THEN 'messages'
    WHEN p_type IN ('health_warning', 'health_critical') THEN 'health'
    ELSE NULL
  END;

  -- Check user preferences if category is mapped
  IF v_category IS NOT NULL THEN
    EXECUTE format(
      'SELECT COALESCE((SELECT %I FROM notification_preferences WHERE user_id = $1), true)',
      v_category || '_in_app'
    ) INTO v_in_app_enabled USING p_user_id;
  END IF;

  -- Only create notification if in_app is enabled for this category
  IF v_in_app_enabled THEN
    INSERT INTO notifications (user_id, type, title, message, action_url)
    VALUES (p_user_id, p_type, p_title, p_message, p_action_url)
    RETURNING id INTO notification_id;
  END IF;

  RETURN notification_id;
END;
$$;

-- Update triggers to use create_notification_checked
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
  IF (NEW.status IN ('completed', 'released')) AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    v_project_title := NEW.title;
    
    SELECT artist_id, engineer_id, producer_id 
    INTO v_partnership
    FROM partnerships 
    WHERE id = NEW.partnership_id;

    IF v_partnership.artist_id IS NOT NULL THEN
      PERFORM create_notification_checked(
        v_partnership.artist_id, 'milestone_reached',
        '🎯 Project Milestone Hit',
        'Project "' || v_project_title || '" is now ' || NEW.status || '!',
        '/artist-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.engineer_id IS NOT NULL THEN
      PERFORM create_notification_checked(
        v_partnership.engineer_id, 'milestone_reached',
        '🎯 Project Milestone Hit',
        'Project "' || v_project_title || '" is now ' || NEW.status || '!',
        '/engineer-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.producer_id IS NOT NULL THEN
      PERFORM create_notification_checked(
        v_partnership.producer_id, 'milestone_reached',
        '🎯 Project Milestone Hit',
        'Project "' || v_project_title || '" is now ' || NEW.status || '!',
        '/producer-crm?tab=earnings'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

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
      PERFORM create_notification_checked(
        v_partnership.artist_id, 'payment_received',
        '💰 Revenue Split Completed',
        'You received $' || ROUND(NEW.artist_amount::numeric, 2)::TEXT || ' from a ' || v_amount_text || ' split.',
        '/artist-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.engineer_id IS NOT NULL AND NEW.engineer_amount > 0 THEN
      PERFORM create_notification_checked(
        v_partnership.engineer_id, 'payment_received',
        '💰 Revenue Split Completed',
        'You received $' || ROUND(NEW.engineer_amount::numeric, 2)::TEXT || ' from a ' || v_amount_text || ' split.',
        '/engineer-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.producer_id IS NOT NULL THEN
      PERFORM create_notification_checked(
        v_partnership.producer_id, 'payment_received',
        '💰 Revenue Split Completed',
        'Revenue split of ' || v_amount_text || ' has been completed.',
        '/producer-crm?tab=earnings'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

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
      PERFORM create_notification_checked(
        v_partnership.artist_id, v_notification_type,
        '⚠️ Partnership Health ' || v_severity,
        'Partnership health score dropped to ' || NEW.health_score || '/100. Review activity and payments.',
        '/artist-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.engineer_id IS NOT NULL THEN
      PERFORM create_notification_checked(
        v_partnership.engineer_id, v_notification_type,
        '⚠️ Partnership Health ' || v_severity,
        'Partnership health score dropped to ' || NEW.health_score || '/100. Review activity and payments.',
        '/engineer-crm?tab=earnings'
      );
    END IF;

    IF v_partnership.producer_id IS NOT NULL THEN
      PERFORM create_notification_checked(
        v_partnership.producer_id, v_notification_type,
        '⚠️ Partnership Health ' || v_severity,
        'Partnership health score dropped to ' || NEW.health_score || '/100. Review activity and payments.',
        '/producer-crm?tab=earnings'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_session_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inviter_name TEXT;
  session_title TEXT;
BEGIN
  SELECT COALESCE(full_name, email) INTO inviter_name
  FROM profiles WHERE id = NEW.inviter_id;
  
  SELECT title INTO session_title
  FROM collaboration_sessions WHERE id = NEW.session_id;
  
  IF NEW.engineer_id IS NOT NULL THEN
    PERFORM create_notification_checked(
      NEW.engineer_id, 'collaboration_invite',
      'Session Invitation',
      inviter_name || ' invited you to collaborate on "' || session_title || '"',
      '/session-invitations'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

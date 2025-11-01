-- Additional search_path fixes for remaining SECURITY DEFINER functions

-- Credits and financial functions
CREATE OR REPLACE FUNCTION public.check_user_credits(p_user_id uuid, p_required_credits integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_amount integer, p_description text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO public.user_credits (user_id, credits_balance, total_credits_purchased)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET credits_balance = user_credits.credits_balance + p_amount,
      total_credits_purchased = user_credits.total_credits_purchased + p_amount,
      updated_at = now()
  RETURNING credits_balance INTO v_new_balance;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'purchase', p_description);
  
  RETURN v_new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_description text DEFAULT NULL, p_job_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.user_credits
  SET credits_balance = credits_balance - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits_balance INTO v_new_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User credits not found';
  END IF;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, separation_job_id)
  VALUES (p_user_id, -p_amount, 'deduction', p_description, p_job_id);
  
  RETURN v_new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_free_tier_available(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_separation TIMESTAMP WITH TIME ZONE;
  v_separations_used INTEGER;
BEGIN
  SELECT last_free_separation, free_separations_used
  INTO v_last_separation, v_separations_used
  FROM public.stem_separation_limits
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.stem_separation_limits (user_id)
    VALUES (p_user_id);
    RETURN true;
  END IF;
  
  IF v_last_separation IS NULL OR DATE(v_last_separation) < CURRENT_DATE THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.use_free_tier(p_user_id uuid, p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.stem_separation_limits (user_id, free_separations_used, last_free_separation)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE
  SET free_separations_used = stem_separation_limits.free_separations_used + 1,
      last_free_separation = now(),
      updated_at = now();
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, separation_job_id)
  VALUES (p_user_id, 0, 'free_tier', 'Free 4-stem separation used', p_job_id);
  
  RETURN true;
END;
$$;

-- Notification functions
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_action_url text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, action_url, 
    related_id, related_type, metadata
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_action_url,
    p_related_id, p_related_type, p_metadata
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Security and admin functions
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text,
  p_admin_id uuid,
  p_description text,
  p_details jsonb DEFAULT '{}',
  p_auto_action text DEFAULT 'none'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO admin_security_events (
    event_type,
    severity,
    admin_id,
    description,
    details,
    auto_action_taken
  ) VALUES (
    p_event_type,
    p_severity,
    p_admin_id,
    p_description,
    p_details,
    p_auto_action
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_admin_alert(
  p_alert_type text,
  p_severity text,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO admin_alerts (alert_type, severity, title, message, metadata)
  VALUES (p_alert_type, p_severity, p_title, p_message, p_metadata)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_security_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats jsonb;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  SELECT jsonb_build_object(
    'total_events_today', (
      SELECT COUNT(*) FROM admin_security_events
      WHERE created_at >= CURRENT_DATE
    ),
    'critical_unresolved', (
      SELECT COUNT(*) FROM admin_security_events
      WHERE severity = 'critical' AND is_resolved = false
    ),
    'high_unresolved', (
      SELECT COUNT(*) FROM admin_security_events
      WHERE severity = 'high' AND is_resolved = false
    ),
    'injection_attempts_today', (
      SELECT COALESCE(SUM(injection_attempts_detected), 0) FROM chatbot_audit_logs
      WHERE created_at >= CURRENT_DATE
    ),
    'failed_security_checks_today', (
      SELECT COUNT(*) FROM chatbot_audit_logs
      WHERE created_at >= CURRENT_DATE AND security_check_passed = false
    ),
    'total_audit_logs', (
      SELECT COUNT(*) FROM chatbot_audit_logs
    ),
    'quick_actions_today', (
      SELECT COUNT(*) FROM admin_quick_actions
      WHERE created_at >= CURRENT_DATE
    )
  )
  INTO stats;
  
  RETURN stats;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_admin_chatbot_rate_limit(
  p_admin_id uuid,
  p_limit_per_minute integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_count integer;
BEGIN
  SELECT COUNT(*)
  INTO message_count
  FROM chatbot_audit_logs
  WHERE admin_id = p_admin_id
    AND created_at >= now() - interval '1 minute';
  
  IF message_count >= p_limit_per_minute THEN
    PERFORM log_security_event(
      'rate_limit',
      'medium',
      p_admin_id,
      'Admin chatbot rate limit exceeded',
      jsonb_build_object('message_count', message_count, 'limit', p_limit_per_minute),
      'alert_sent'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;
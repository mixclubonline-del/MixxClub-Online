
-- =============================================
-- Harden SECURITY DEFINER functions with auth checks
-- =============================================

-- 1. get_security_dashboard_stats: Require admin role
CREATE OR REPLACE FUNCTION public.get_security_dashboard_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'total_events', (SELECT COUNT(*) FROM public.admin_security_events),
    'critical_events', (SELECT COUNT(*) FROM public.admin_security_events WHERE severity = 'critical' AND NOT is_resolved),
    'high_events', (SELECT COUNT(*) FROM public.admin_security_events WHERE severity = 'high' AND NOT is_resolved),
    'resolved_today', (SELECT COUNT(*) FROM public.admin_security_events WHERE DATE(resolved_at) = CURRENT_DATE),
    'failed_logins', (SELECT COUNT(*) FROM public.audit_logs WHERE action = 'login_failed' AND created_at > NOW() - INTERVAL '24 hours')
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- 2. cleanup_old_chatbot_messages: Require admin role
CREATE OR REPLACE FUNCTION public.cleanup_old_chatbot_messages(days_to_keep integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  DELETE FROM public.chatbot_messages
  WHERE created_at < NOW() - make_interval(days => days_to_keep);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- 3. cleanup_old_notifications: Require admin role
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(days_to_keep integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  DELETE FROM public.notifications
  WHERE created_at < NOW() - make_interval(days => days_to_keep)
    AND is_read = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- 4. cleanup_old_audit_logs: Require admin role
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - make_interval(days => days_to_keep);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- 5. calculate_partnership_health: Require authenticated user who is part of partnership
CREATE OR REPLACE FUNCTION public.calculate_partnership_health(p_partnership_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_activity_score INTEGER := 100;
  v_payment_score INTEGER := 100;
  v_communication_score INTEGER := 100;
  v_health_score INTEGER;
  v_last_activity TIMESTAMPTZ;
  v_pending_payments INTEGER;
  v_caller_id UUID;
BEGIN
  -- Require authentication
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify caller is part of this partnership or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.partnerships
    WHERE id = p_partnership_id
      AND (artist_id = v_caller_id OR engineer_id = v_caller_id OR producer_id = v_caller_id)
  ) AND NOT public.has_role(v_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: not a member of this partnership';
  END IF;

  -- Activity score based on last project activity
  SELECT MAX(updated_at) INTO v_last_activity
  FROM public.collaborative_projects
  WHERE partnership_id = p_partnership_id;

  IF v_last_activity IS NOT NULL THEN
    IF v_last_activity < now() - INTERVAL '90 days' THEN
      v_activity_score := 50;
    ELSIF v_last_activity < now() - INTERVAL '30 days' THEN
      v_activity_score := 75;
    END IF;
  END IF;

  -- Payment score based on pending payments
  SELECT COUNT(*) INTO v_pending_payments
  FROM public.revenue_splits
  WHERE partnership_id = p_partnership_id AND status = 'pending';

  IF v_pending_payments > 5 THEN
    v_payment_score := 50;
  ELSIF v_pending_payments > 2 THEN
    v_payment_score := 75;
  END IF;

  -- Calculate overall health score
  v_health_score := (v_activity_score + v_payment_score + v_communication_score) / 3;

  -- Update health record
  INSERT INTO public.partnership_health (
    partnership_id, health_score, activity_score, 
    payment_score, communication_score, last_calculated_at, factors
  )
  VALUES (
    p_partnership_id, v_health_score, v_activity_score,
    v_payment_score, v_communication_score, now(),
    jsonb_build_object(
      'last_activity', v_last_activity,
      'pending_payments', v_pending_payments
    )
  )
  ON CONFLICT (partnership_id) DO UPDATE SET
    health_score = EXCLUDED.health_score,
    activity_score = EXCLUDED.activity_score,
    payment_score = EXCLUDED.payment_score,
    communication_score = EXCLUDED.communication_score,
    last_calculated_at = EXCLUDED.last_calculated_at,
    factors = EXCLUDED.factors;

  RETURN v_health_score;
END;
$function$;

-- 6. calculate_partnership_metrics: Require authenticated user who is part of partnership
CREATE OR REPLACE FUNCTION public.calculate_partnership_metrics(p_partnership_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_projects INTEGER;
  v_completed_projects INTEGER;
  v_total_revenue NUMERIC;
  v_avg_value NUMERIC;
  v_caller_id UUID;
BEGIN
  -- Require authentication
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify caller is part of this partnership or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.partnerships
    WHERE id = p_partnership_id
      AND (artist_id = v_caller_id OR engineer_id = v_caller_id OR producer_id = v_caller_id)
  ) AND NOT public.has_role(v_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: not a member of this partnership';
  END IF;

  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed' OR status = 'released'),
    COALESCE(SUM(total_revenue), 0)
  INTO v_total_projects, v_completed_projects, v_total_revenue
  FROM public.collaborative_projects
  WHERE partnership_id = p_partnership_id;

  v_avg_value := CASE WHEN v_total_projects > 0 THEN v_total_revenue / v_total_projects ELSE 0 END;

  INSERT INTO public.partnership_metrics (
    partnership_id, total_projects, completed_projects, 
    total_revenue, average_project_value, last_activity_at, calculated_at
  )
  VALUES (
    p_partnership_id, v_total_projects, v_completed_projects,
    v_total_revenue, v_avg_value, now(), now()
  )
  ON CONFLICT (partnership_id) DO UPDATE SET
    total_projects = EXCLUDED.total_projects,
    completed_projects = EXCLUDED.completed_projects,
    total_revenue = EXCLUDED.total_revenue,
    average_project_value = EXCLUDED.average_project_value,
    last_activity_at = EXCLUDED.last_activity_at,
    calculated_at = EXCLUDED.calculated_at;
END;
$function$;

-- 7. process_stream_gift: Verify sender matches authenticated user
CREATE OR REPLACE FUNCTION public.process_stream_gift(p_stream_id uuid, p_sender_id uuid, p_gift_id uuid, p_quantity integer DEFAULT 1, p_message text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_gift_cost INTEGER;
  v_creator_value NUMERIC;
  v_sender_balance INTEGER;
  v_gift_record_id UUID;
  v_host_id UUID;
  v_caller_id UUID;
BEGIN
  -- Require authentication and verify sender is the caller
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF v_caller_id != p_sender_id THEN
    RAISE EXCEPTION 'Cannot send gifts on behalf of another user';
  END IF;

  -- Get gift cost and creator value
  SELECT coin_cost, creator_value INTO v_gift_cost, v_creator_value
  FROM public.live_gifts WHERE id = p_gift_id AND is_active = true;
  
  IF v_gift_cost IS NULL THEN
    RAISE EXCEPTION 'Gift not found or inactive';
  END IF;
  
  -- Get sender balance
  SELECT balance INTO v_sender_balance
  FROM public.user_coins WHERE user_id = p_sender_id;
  
  IF v_sender_balance IS NULL OR v_sender_balance < (v_gift_cost * p_quantity) THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;
  
  -- Get stream host
  SELECT host_id INTO v_host_id FROM public.live_streams WHERE id = p_stream_id;
  
  -- Deduct coins from sender
  UPDATE public.user_coins 
  SET 
    balance = balance - (v_gift_cost * p_quantity),
    total_spent = total_spent + (v_gift_cost * p_quantity),
    updated_at = now()
  WHERE user_id = p_sender_id;
  
  -- Add gift value to stream total
  UPDATE public.live_streams 
  SET 
    total_gifts_value = total_gifts_value + (v_creator_value * p_quantity),
    updated_at = now()
  WHERE id = p_stream_id;
  
  -- Record the gift
  INSERT INTO public.stream_gifts (stream_id, sender_id, gift_id, quantity, message)
  VALUES (p_stream_id, p_sender_id, p_gift_id, p_quantity, p_message)
  RETURNING id INTO v_gift_record_id;
  
  RETURN v_gift_record_id;
END;
$function$;

-- 8. increment_course_enrollments: Require authentication
CREATE OR REPLACE FUNCTION public.increment_course_enrollments(p_course_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE courses 
  SET total_enrollments = COALESCE(total_enrollments, 0) + 1
  WHERE id = p_course_id;
END;
$function$;

-- 9. get_or_create_wallet: Only allow for own user_id
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(p_user_id uuid)
 RETURNS mixx_wallets
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  wallet public.mixx_wallets;
  v_caller_id UUID;
BEGIN
  -- Require authentication and verify caller is requesting own wallet
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF v_caller_id != p_user_id AND NOT public.has_role(v_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Cannot access another user wallet';
  END IF;

  SELECT * INTO wallet FROM public.mixx_wallets WHERE user_id = p_user_id;
  
  IF wallet IS NULL THEN
    INSERT INTO public.mixx_wallets (user_id)
    VALUES (p_user_id)
    RETURNING * INTO wallet;
  END IF;
  
  RETURN wallet;
END;
$function$;

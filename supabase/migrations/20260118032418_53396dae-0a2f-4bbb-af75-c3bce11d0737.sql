-- Fix function search path for notify_payout_ready
CREATE OR REPLACE FUNCTION public.notify_payout_ready()
RETURNS TRIGGER AS $$
BEGIN
  -- When a payout becomes eligible and is still pending, notify admins
  IF NEW.status = 'pending' 
     AND NEW.eligible_for_payout_at IS NOT NULL
     AND NEW.eligible_for_payout_at <= NOW() 
     AND (OLD.eligible_for_payout_at IS NULL OR OLD.eligible_for_payout_at > NOW()) THEN
    
    INSERT INTO public.notifications (user_id, title, message, type, metadata)
    SELECT ur.user_id, 
           'Payout Ready for Processing', 
           format('Engineer payout of $%s is ready for processing', NEW.net_amount::TEXT),
           'admin_action', 
           jsonb_build_object(
             'payout_id', NEW.id, 
             'amount', NEW.net_amount,
             'engineer_id', NEW.engineer_id
           )
    FROM public.user_roles ur 
    WHERE ur.role = 'admin' 
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
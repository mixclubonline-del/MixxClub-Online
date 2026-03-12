
-- Invite wave tracking
CREATE TABLE public.invite_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_label TEXT NOT NULL,
  wave_number INTEGER NOT NULL DEFAULT 1,
  role_filter TEXT,
  target_count INTEGER NOT NULL,
  actual_sent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  sent_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invite_waves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invite waves"
ON public.invite_waves
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Referral tracking on waitlist
ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Auto-generate referral code on insert
CREATE OR REPLACE FUNCTION public.generate_waitlist_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'WL-' || UPPER(SUBSTRING(MD5(NEW.id::text || now()::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_generate_waitlist_referral_code
  BEFORE INSERT ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_waitlist_referral_code();

-- Bump referrers who get 3+ referrals
CREATE OR REPLACE FUNCTION public.bump_referrer_position()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_count INTEGER;
  v_current_position INTEGER;
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    SELECT id, position INTO v_referrer_id, v_current_position
    FROM public.waitlist_signups
    WHERE referral_code = NEW.referred_by
    LIMIT 1;

    IF v_referrer_id IS NOT NULL THEN
      SELECT COUNT(*) INTO v_referral_count
      FROM public.waitlist_signups
      WHERE referred_by = NEW.referred_by;

      -- Every 3 referrals, bump position up by 5
      IF v_referral_count > 0 AND v_referral_count % 3 = 0 THEN
        UPDATE public.waitlist_signups
        SET position = GREATEST(1, v_current_position - 5)
        WHERE id = v_referrer_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_bump_referrer_position
  AFTER INSERT ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_referrer_position();

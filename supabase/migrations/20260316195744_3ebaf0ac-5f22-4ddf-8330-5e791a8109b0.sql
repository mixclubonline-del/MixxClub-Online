
-- Producer earnings ledger table
CREATE TABLE public.producer_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL,
  purchase_id UUID REFERENCES public.beat_purchases(id) ON DELETE SET NULL,
  beat_id UUID REFERENCES public.producer_beats(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Index for balance queries
CREATE INDEX idx_producer_earnings_producer_status ON public.producer_earnings(producer_id, status);

-- Enable RLS
ALTER TABLE public.producer_earnings ENABLE ROW LEVEL SECURITY;

-- Producers can read their own earnings
CREATE POLICY "Producers can view own earnings"
  ON public.producer_earnings FOR SELECT
  TO authenticated
  USING (producer_id = auth.uid());

-- Admins can manage all earnings
CREATE POLICY "Admins can manage all earnings"
  ON public.producer_earnings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger: auto-insert producer earnings when beat_purchase completes
CREATE OR REPLACE FUNCTION public.record_producer_earning()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    INSERT INTO public.producer_earnings (producer_id, purchase_id, beat_id, amount_cents, status)
    VALUES (NEW.seller_id, NEW.id, NEW.beat_id, NEW.seller_earnings_cents, 'pending')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_record_producer_earning
  AFTER INSERT OR UPDATE ON public.beat_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.record_producer_earning();

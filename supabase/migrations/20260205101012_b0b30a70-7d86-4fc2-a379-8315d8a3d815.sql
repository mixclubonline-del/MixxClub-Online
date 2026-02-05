-- Beat purchases table for marketplace transactions
CREATE TABLE public.beat_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid REFERENCES producer_beats(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  license_type text NOT NULL CHECK (license_type IN ('lease', 'exclusive')),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  platform_fee_cents integer NOT NULL DEFAULT 0,
  seller_earnings_cents integer NOT NULL,
  stripe_payment_intent_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  downloaded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beat_purchases ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own purchases
CREATE POLICY "Buyers can view their purchases" 
ON public.beat_purchases 
FOR SELECT 
USING (auth.uid() = buyer_id);

-- Sellers can view sales of their beats
CREATE POLICY "Sellers can view their sales" 
ON public.beat_purchases 
FOR SELECT 
USING (auth.uid() = seller_id);

-- Only system can insert (via edge function)
CREATE POLICY "System can insert purchases" 
ON public.beat_purchases 
FOR INSERT 
WITH CHECK (true);

-- Update producer stats on completed sale
CREATE OR REPLACE FUNCTION public.update_producer_stats_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    -- Update producer_stats
    UPDATE public.producer_stats
    SET 
      total_sales = COALESCE(total_sales, 0) + 1,
      total_revenue_cents = COALESCE(total_revenue_cents, 0) + NEW.seller_earnings_cents,
      updated_at = now()
    WHERE user_id = NEW.seller_id;
    
    -- Update producer_beats download count
    UPDATE public.producer_beats
    SET downloads = COALESCE(downloads, 0) + 1
    WHERE id = NEW.beat_id;
    
    -- Create notification for seller
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.seller_id,
      'sale',
      '🎵 New Beat Sale!',
      format('Your beat just sold for $%s', (NEW.amount_cents::numeric / 100)::text),
      jsonb_build_object('beat_id', NEW.beat_id, 'amount_cents', NEW.amount_cents, 'license_type', NEW.license_type)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating stats on sale
CREATE TRIGGER trigger_update_producer_stats_on_sale
AFTER INSERT OR UPDATE ON public.beat_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_producer_stats_on_sale();

-- Add indexes for performance
CREATE INDEX idx_beat_purchases_buyer_id ON public.beat_purchases(buyer_id);
CREATE INDEX idx_beat_purchases_seller_id ON public.beat_purchases(seller_id);
CREATE INDEX idx_beat_purchases_beat_id ON public.beat_purchases(beat_id);
CREATE INDEX idx_beat_purchases_status ON public.beat_purchases(status);
CREATE INDEX idx_beat_purchases_created_at ON public.beat_purchases(created_at DESC);

-- Enable realtime for sales notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.beat_purchases;
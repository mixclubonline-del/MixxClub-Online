-- Create reviews table for post-collaboration feedback
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewed_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('artist_to_engineer', 'engineer_to_artist')),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  would_work_again BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, reviewer_id)
);

-- Create session_payments table for payment tracking
CREATE TABLE public.session_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL,
  payee_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'refunded', 'failed')),
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_payments ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Users can view public reviews" ON public.reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = reviewed_id);

CREATE POLICY "Users can create reviews for sessions they participated in" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Session payments policies
CREATE POLICY "Payer can view their payments" ON public.session_payments
  FOR SELECT USING (auth.uid() = payer_id);

CREATE POLICY "Payee can view their payments" ON public.session_payments
  FOR SELECT USING (auth.uid() = payee_id);

CREATE POLICY "Payer can create payments" ON public.session_payments
  FOR INSERT WITH CHECK (auth.uid() = payer_id);

-- Add realtime for session_payments
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_payments;

-- Create updated_at trigger for reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for session_payments  
CREATE TRIGGER update_session_payments_updated_at
  BEFORE UPDATE ON public.session_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
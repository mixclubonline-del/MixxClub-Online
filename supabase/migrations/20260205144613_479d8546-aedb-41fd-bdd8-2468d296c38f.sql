-- Create match_requests table for collaboration requests
CREATE TABLE public.match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message TEXT,
  project_type TEXT,
  budget_range TEXT,
  genres TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own requests"
  ON public.match_requests FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create requests"
  ON public.match_requests FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update request status"
  ON public.match_requests FOR UPDATE
  USING (recipient_id = auth.uid() OR sender_id = auth.uid());

-- Index for faster lookups
CREATE INDEX idx_match_requests_sender ON public.match_requests(sender_id);
CREATE INDEX idx_match_requests_recipient ON public.match_requests(recipient_id);
CREATE INDEX idx_match_requests_status ON public.match_requests(status);
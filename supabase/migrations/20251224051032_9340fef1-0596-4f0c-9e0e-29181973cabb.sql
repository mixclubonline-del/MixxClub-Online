
-- Create waitlist signups table
CREATE TABLE public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('artist', 'engineer', 'fan')),
  referral_code TEXT,
  source TEXT DEFAULT 'coming-soon',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can sign up)
CREATE POLICY "Anyone can sign up for waitlist"
ON public.waitlist_signups
FOR INSERT
WITH CHECK (true);

-- Allow public to count signups for social proof
CREATE POLICY "Anyone can view signup counts"
ON public.waitlist_signups
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_waitlist_signups_role ON public.waitlist_signups(role);
CREATE INDEX idx_waitlist_signups_created_at ON public.waitlist_signups(created_at);

-- Create enum for stem separation status
CREATE TYPE stem_separation_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Create enum for stem tier
CREATE TYPE stem_tier AS ENUM ('free_4stem', 'credit_9stem');

-- Create stem_separation_jobs table
CREATE TABLE public.stem_separation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audio_file_id UUID REFERENCES public.audio_files(id) ON DELETE CASCADE,
  original_file_path TEXT NOT NULL,
  status stem_separation_status NOT NULL DEFAULT 'pending',
  tier stem_tier NOT NULL,
  stems_count INTEGER NOT NULL,
  credits_used INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  stem_paths JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_credits table
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER DEFAULT 0,
  monthly_credits INTEGER DEFAULT 0,
  last_monthly_refill TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create credit_transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  separation_job_id UUID REFERENCES public.stem_separation_jobs(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stem_separation_limits table
CREATE TABLE public.stem_separation_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  free_separations_used INTEGER DEFAULT 0,
  last_free_separation TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.stem_separation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stem_separation_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stem_separation_jobs
CREATE POLICY "Users can view their own separation jobs"
  ON public.stem_separation_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own separation jobs"
  ON public.stem_separation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own separation jobs"
  ON public.stem_separation_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can update all separation jobs"
  ON public.stem_separation_jobs FOR UPDATE
  USING (true);

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage credits"
  ON public.user_credits FOR ALL
  USING (true);

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for stem_separation_limits
CREATE POLICY "Users can view their own limits"
  ON public.stem_separation_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage limits"
  ON public.stem_separation_limits FOR ALL
  USING (true);

-- Create indexes
CREATE INDEX idx_stem_jobs_user_id ON public.stem_separation_jobs(user_id);
CREATE INDEX idx_stem_jobs_status ON public.stem_separation_jobs(status);
CREATE INDEX idx_stem_jobs_created_at ON public.stem_separation_jobs(created_at DESC);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Create function to check user credits
CREATE OR REPLACE FUNCTION public.check_user_credits(p_user_id UUID, p_required_credits INTEGER)
RETURNS BOOLEAN
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
    -- Initialize credits for new user
    INSERT INTO public.user_credits (user_id, credits_balance)
    VALUES (p_user_id, 0)
    RETURNING credits_balance INTO v_balance;
  END IF;
  
  RETURN v_balance >= p_required_credits;
END;
$$;

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT DEFAULT NULL, p_job_id UUID DEFAULT NULL)
RETURNS INTEGER
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

-- Create function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT DEFAULT NULL)
RETURNS INTEGER
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

-- Create function to check free tier limits
CREATE OR REPLACE FUNCTION public.check_free_tier_available(p_user_id UUID)
RETURNS BOOLEAN
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
    -- Initialize limits for new user
    INSERT INTO public.stem_separation_limits (user_id)
    VALUES (p_user_id);
    RETURN true;
  END IF;
  
  -- Check if last separation was today
  IF v_last_separation IS NULL OR DATE(v_last_separation) < CURRENT_DATE THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create function to use free tier
CREATE OR REPLACE FUNCTION public.use_free_tier(p_user_id UUID, p_job_id UUID)
RETURNS BOOLEAN
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

-- Create storage bucket for stem separations
INSERT INTO storage.buckets (id, name, public)
VALUES ('stem-separations', 'stem-separations', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stem-separations bucket
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stem-separations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own stems"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'stem-separations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own stems"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stem-separations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update function for automatic updated_at
CREATE OR REPLACE FUNCTION update_stem_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stem_jobs_timestamp
BEFORE UPDATE ON public.stem_separation_jobs
FOR EACH ROW
EXECUTE FUNCTION update_stem_jobs_updated_at();
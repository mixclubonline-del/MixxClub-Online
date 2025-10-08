-- Create points_ledger table
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_delta INTEGER NOT NULL,
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'cashout', 'bonus', 'refund')),
  related_id UUID,
  related_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

-- Users can view their own ledger
CREATE POLICY "Users can view own ledger"
  ON public.points_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert ledger entries
CREATE POLICY "Service role can insert"
  ON public.points_ledger FOR INSERT
  WITH CHECK (true);

-- Create index
CREATE INDEX idx_points_ledger_user_created ON public.points_ledger(user_id, created_at DESC);

-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Users can view disputes they're involved in
CREATE POLICY "Users can view relevant disputes"
  ON public.disputes FOR SELECT
  USING (
    raised_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = disputes.project_id
      AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
    ) OR
    is_admin(auth.uid())
  );

-- Users can create disputes for their projects
CREATE POLICY "Users can create disputes"
  ON public.disputes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
      AND (p.client_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

-- Admins can update disputes
CREATE POLICY "Admins can update disputes"
  ON public.disputes FOR UPDATE
  USING (is_admin(auth.uid()));

-- Create index
CREATE INDEX idx_disputes_project ON public.disputes(project_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);

-- Add stripe_connect_id to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'stripe_connect_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_connect_id TEXT;
  END IF;
END $$;
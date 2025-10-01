-- Create table for project agreements
CREATE TABLE IF NOT EXISTS public.project_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  engineer_id UUID,
  scope_of_work TEXT NOT NULL,
  engineer_split_percent NUMERIC NOT NULL DEFAULT 70,
  artist_signed_at TIMESTAMP WITH TIME ZONE,
  engineer_signed_at TIMESTAMP WITH TIME ZONE,
  artist_signature_ip TEXT,
  engineer_signature_ip TEXT,
  agreement_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_agreements ENABLE ROW LEVEL SECURITY;

-- Artists can create agreements for their projects
CREATE POLICY "Artists can create agreements"
ON public.project_agreements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = artist_id);

-- Users can view agreements for their projects
CREATE POLICY "Users can view their project agreements"
ON public.project_agreements
FOR SELECT
TO authenticated
USING (
  auth.uid() = artist_id OR 
  auth.uid() = engineer_id
);

-- Users can sign agreements for their projects
CREATE POLICY "Users can sign their agreements"
ON public.project_agreements
FOR UPDATE
TO authenticated
USING (
  auth.uid() = artist_id OR 
  auth.uid() = engineer_id
);

-- Add trigger for updated_at
CREATE TRIGGER update_project_agreements_updated_at
BEFORE UPDATE ON public.project_agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
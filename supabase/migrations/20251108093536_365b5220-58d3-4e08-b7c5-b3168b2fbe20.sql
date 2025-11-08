-- Create enterprise_accounts table
CREATE TABLE IF NOT EXISTS public.enterprise_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('label', 'studio', 'university', 'custom')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'paused', 'cancelled', 'suspended')),
  package_id TEXT,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual', 'custom')),
  mrr NUMERIC DEFAULT 0,
  custom_domain TEXT,
  white_label_enabled BOOLEAN DEFAULT false,
  sso_enabled BOOLEAN DEFAULT false,
  max_team_members INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 100,
  max_api_calls INTEGER DEFAULT 100000,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enterprise_team_members table
CREATE TABLE IF NOT EXISTS public.enterprise_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  permissions JSONB DEFAULT '[]'::jsonb,
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enterprise_contracts table
CREATE TABLE IF NOT EXISTS public.enterprise_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('standard', 'custom', 'pilot', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'cancelled', 'renewed')),
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  terms JSONB DEFAULT '{}'::jsonb,
  sla_terms JSONB DEFAULT '{}'::jsonb,
  signed_by UUID,
  signed_at TIMESTAMP WITH TIME ZONE,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enterprise_audit_log table
CREATE TABLE IF NOT EXISTS public.enterprise_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
  user_id UUID,
  event_type TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enterprise_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enterprise_accounts
CREATE POLICY "Admins can manage all enterprise accounts"
  ON public.enterprise_accounts
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Team members can view their account"
  ON public.enterprise_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_team_members
      WHERE enterprise_team_members.account_id = enterprise_accounts.id
        AND enterprise_team_members.user_id = auth.uid()
        AND enterprise_team_members.status = 'active'
    )
  );

CREATE POLICY "Account owners can update their account"
  ON public.enterprise_accounts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_team_members
      WHERE enterprise_team_members.account_id = enterprise_accounts.id
        AND enterprise_team_members.user_id = auth.uid()
        AND enterprise_team_members.role IN ('owner', 'admin')
        AND enterprise_team_members.status = 'active'
    )
  );

-- RLS Policies for enterprise_team_members
CREATE POLICY "Admins can manage all team members"
  ON public.enterprise_team_members
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Team members can view their team"
  ON public.enterprise_team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_team_members self
      WHERE self.account_id = enterprise_team_members.account_id
        AND self.user_id = auth.uid()
        AND self.status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage team members"
  ON public.enterprise_team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_team_members self
      WHERE self.account_id = enterprise_team_members.account_id
        AND self.user_id = auth.uid()
        AND self.role IN ('owner', 'admin')
        AND self.status = 'active'
    )
  );

-- RLS Policies for enterprise_contracts
CREATE POLICY "Admins can manage all contracts"
  ON public.enterprise_contracts
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Team members can view their contracts"
  ON public.enterprise_contracts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_team_members
      WHERE enterprise_team_members.account_id = enterprise_contracts.account_id
        AND enterprise_team_members.user_id = auth.uid()
        AND enterprise_team_members.status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage contracts"
  ON public.enterprise_contracts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_team_members
      WHERE enterprise_team_members.account_id = enterprise_contracts.account_id
        AND enterprise_team_members.user_id = auth.uid()
        AND enterprise_team_members.role IN ('owner', 'admin')
        AND enterprise_team_members.status = 'active'
    )
  );

-- RLS Policies for enterprise_audit_log
CREATE POLICY "Admins can view all audit logs"
  ON public.enterprise_audit_log
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.enterprise_audit_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can view their account audit logs"
  ON public.enterprise_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_team_members
      WHERE enterprise_team_members.account_id = enterprise_audit_log.account_id
        AND enterprise_team_members.user_id = auth.uid()
        AND enterprise_team_members.role = 'owner'
        AND enterprise_team_members.status = 'active'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enterprise_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_enterprise_accounts_updated_at
  BEFORE UPDATE ON public.enterprise_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_enterprise_updated_at();

CREATE TRIGGER update_enterprise_contracts_updated_at
  BEFORE UPDATE ON public.enterprise_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_enterprise_updated_at();

-- Create indexes for performance
CREATE INDEX idx_enterprise_accounts_status ON public.enterprise_accounts(status);
CREATE INDEX idx_enterprise_accounts_type ON public.enterprise_accounts(type);
CREATE INDEX idx_enterprise_team_members_account_id ON public.enterprise_team_members(account_id);
CREATE INDEX idx_enterprise_team_members_user_id ON public.enterprise_team_members(user_id);
CREATE INDEX idx_enterprise_team_members_status ON public.enterprise_team_members(status);
CREATE INDEX idx_enterprise_contracts_account_id ON public.enterprise_contracts(account_id);
CREATE INDEX idx_enterprise_contracts_status ON public.enterprise_contracts(status);
CREATE INDEX idx_enterprise_audit_log_account_id ON public.enterprise_audit_log(account_id);
CREATE INDEX idx_enterprise_audit_log_created_at ON public.enterprise_audit_log(created_at DESC);
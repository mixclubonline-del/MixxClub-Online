-- CRM Clients table
CREATE TABLE public.crm_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  client_type TEXT NOT NULL DEFAULT 'other' CHECK (client_type IN ('artist', 'engineer', 'label', 'manager', 'other')),
  source TEXT DEFAULT 'platform' CHECK (source IN ('platform', 'referral', 'website', 'social', 'other')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead')),
  avatar_url TEXT,
  notes_count INTEGER DEFAULT 0,
  deals_count INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRM Deals table (Pipeline)
CREATE TABLE public.crm_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost')),
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  won_at TIMESTAMP WITH TIME ZONE,
  lost_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRM Notes table
CREATE TABLE public.crm_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'call', 'meeting', 'email', 'task', 'follow_up')),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRM Interactions table (Activity Log)
CREATE TABLE public.crm_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('message', 'session', 'project', 'payment', 'call', 'meeting', 'email', 'note', 'deal_update')),
  reference_id UUID,
  summary TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  metadata JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRM Tags table
CREATE TABLE public.crm_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- CRM Client Tags junction table
CREATE TABLE public.crm_client_tags (
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.crm_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_client_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_clients
CREATE POLICY "Users can manage their own clients"
  ON public.crm_clients FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for crm_deals
CREATE POLICY "Users can manage their own deals"
  ON public.crm_deals FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for crm_notes
CREATE POLICY "Users can manage their own notes"
  ON public.crm_notes FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for crm_interactions
CREATE POLICY "Users can manage their own interactions"
  ON public.crm_interactions FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for crm_tags
CREATE POLICY "Users can manage their own tags"
  ON public.crm_tags FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for crm_client_tags
CREATE POLICY "Users can manage their client tags"
  ON public.crm_client_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.crm_clients
    WHERE crm_clients.id = crm_client_tags.client_id
    AND crm_clients.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_crm_clients_user_id ON public.crm_clients(user_id);
CREATE INDEX idx_crm_clients_status ON public.crm_clients(status);
CREATE INDEX idx_crm_deals_user_id ON public.crm_deals(user_id);
CREATE INDEX idx_crm_deals_client_id ON public.crm_deals(client_id);
CREATE INDEX idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX idx_crm_notes_client_id ON public.crm_notes(client_id);
CREATE INDEX idx_crm_interactions_client_id ON public.crm_interactions(client_id);
CREATE INDEX idx_crm_interactions_occurred_at ON public.crm_interactions(occurred_at DESC);

-- Function to update client stats
CREATE OR REPLACE FUNCTION public.update_crm_client_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'crm_notes' THEN
    UPDATE crm_clients SET 
      notes_count = (SELECT COUNT(*) FROM crm_notes WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)),
      updated_at = now()
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  ELSIF TG_TABLE_NAME = 'crm_deals' THEN
    UPDATE crm_clients SET 
      deals_count = (SELECT COUNT(*) FROM crm_deals WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)),
      total_value = (SELECT COALESCE(SUM(value), 0) FROM crm_deals WHERE client_id = COALESCE(NEW.client_id, OLD.client_id) AND stage = 'won'),
      updated_at = now()
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  ELSIF TG_TABLE_NAME = 'crm_interactions' THEN
    UPDATE crm_clients SET 
      last_interaction_at = (SELECT MAX(occurred_at) FROM crm_interactions WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)),
      updated_at = now()
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers for auto-updating client stats
CREATE TRIGGER update_client_notes_count
  AFTER INSERT OR DELETE ON public.crm_notes
  FOR EACH ROW EXECUTE FUNCTION update_crm_client_stats();

CREATE TRIGGER update_client_deals_count
  AFTER INSERT OR UPDATE OR DELETE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION update_crm_client_stats();

CREATE TRIGGER update_client_last_interaction
  AFTER INSERT ON public.crm_interactions
  FOR EACH ROW EXECUTE FUNCTION update_crm_client_stats();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_interactions;
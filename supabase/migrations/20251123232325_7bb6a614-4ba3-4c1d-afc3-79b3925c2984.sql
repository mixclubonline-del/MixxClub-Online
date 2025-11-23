-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS engineer_id UUID REFERENCES profiles(id);

-- Add missing column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;

-- Create engineer_leaderboard view
CREATE OR REPLACE VIEW engineer_leaderboard AS
SELECT 
  ep.user_id,
  ep.id as engineer_id,
  ROW_NUMBER() OVER (ORDER BY 
    COALESCE(ep.rating, 0) * 0.4 + 
    COALESCE(ep.completed_projects, 0) * 0.3 + 
    COALESCE((SELECT SUM(amount) FROM engineer_earnings WHERE engineer_id = ep.user_id), 0) * 0.3 
  DESC) as rank,
  ep.rating as average_rating,
  ep.completed_projects,
  COALESCE((SELECT SUM(amount) FROM engineer_earnings WHERE engineer_id = ep.user_id), 0) as total_earnings
FROM engineer_profiles ep;

-- Create engineer_badges table
CREATE TABLE IF NOT EXISTS engineer_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_rarity TEXT DEFAULT 'common',
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE engineer_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers can view their own badges"
  ON engineer_badges FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Everyone can view all badges"
  ON engineer_badges FOR SELECT
  USING (true);

-- Create studio_partnerships table
CREATE TABLE IF NOT EXISTS studio_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_name TEXT NOT NULL,
  studio_type TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT,
  location_country TEXT NOT NULL,
  equipment_list TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC,
  day_rate NUMERIC,
  rating_average NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE studio_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active studio partnerships"
  ON studio_partnerships FOR SELECT
  USING (is_active = true);

-- Create enterprise_contracts table
CREATE TABLE IF NOT EXISTS enterprise_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  contract_name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  contract_value NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE enterprise_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts"
  ON enterprise_contracts FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all contracts"
  ON enterprise_contracts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create contract_expiration_notifications table
CREATE TABLE IF NOT EXISTS contract_expiration_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES enterprise_contracts(id) ON DELETE CASCADE,
  notification_date TIMESTAMP WITH TIME ZONE NOT NULL,
  days_until_expiration INTEGER NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE contract_expiration_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications for their contracts"
  ON contract_expiration_notifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM enterprise_contracts 
    WHERE id = contract_id AND client_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_studio_partnerships_updated_at
  BEFORE UPDATE ON studio_partnerships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_contracts_updated_at
  BEFORE UPDATE ON enterprise_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
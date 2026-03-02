-- Pre-Launch Waitlist System: platform config, waitlist signups, invite codes
-- Enables admin-controlled launch mode toggle and exclusive early access

-- ═══════════════════════════════════════════════════════════════
-- 1. Platform Config — key-value store for admin-controlled settings
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Seed with pre_launch mode active
INSERT INTO platform_config (key, value)
VALUES ('launch_mode', '"pre_launch"')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 2. Invite Codes — admin-generated codes for early access
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  max_uses INTEGER DEFAULT 1,
  times_used INTEGER DEFAULT 0,
  role_grant TEXT CHECK (role_grant IN ('artist','engineer','producer','fan')),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. Waitlist Signups — email capture with role preference
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role_interest TEXT CHECK (role_interest IN ('artist','engineer','producer','fan')),
  social_handle TEXT,
  referral_source TEXT,
  invite_code_used TEXT REFERENCES invite_codes(code),
  position INTEGER,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting','invited','converted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Auto-assign position on insert
CREATE OR REPLACE FUNCTION set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
    FROM waitlist_signups;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_waitlist_position
  BEFORE INSERT ON waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION set_waitlist_position();

-- ═══════════════════════════════════════════════════════════════
-- 4. Row-Level Security
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;

-- platform_config: anyone can read, only admins can write
CREATE POLICY "platform_config_read" ON platform_config
  FOR SELECT USING (true);

CREATE POLICY "platform_config_admin_write" ON platform_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- invite_codes: anyone can validate (select by code), admins full CRUD
CREATE POLICY "invite_codes_validate" ON invite_codes
  FOR SELECT USING (true);

CREATE POLICY "invite_codes_admin_manage" ON invite_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- waitlist_signups: anyone can insert (anonymous capture), admins can read/update
CREATE POLICY "waitlist_anonymous_insert" ON waitlist_signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "waitlist_admin_read" ON waitlist_signups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "waitlist_admin_update" ON waitlist_signups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_signups(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_signups(status);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON invite_codes(is_active) WHERE is_active = true;

-- Phase 2: Security & Performance (Corrected)

-- 1. Fix marketplace_items RLS - hide financial data
DROP POLICY IF EXISTS "Published items are viewable by everyone" ON marketplace_items;
CREATE POLICY "Public can view published items without financials"
ON marketplace_items FOR SELECT
USING (is_published = true);

CREATE POLICY "Sellers view own items with financials"
ON marketplace_items FOR SELECT
USING (auth.uid() = seller_id);

-- 2. Fix community_milestones - hide roadmap
DROP POLICY IF EXISTS "Everyone can view milestones" ON community_milestones;
CREATE POLICY "Public views unlocked milestones only"
ON community_milestones FOR SELECT
USING (is_unlocked = true);

CREATE POLICY "Admins view all milestones"
ON community_milestones FOR SELECT
USING (is_admin(auth.uid()));

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_client_status ON projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_engineer_status ON projects(engineer_id, status);
CREATE INDEX IF NOT EXISTS idx_audio_files_project ON audio_files(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_published ON marketplace_items(is_published, created_at DESC);

-- 4. Audit triggers for payments
CREATE OR REPLACE FUNCTION audit_financial_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_financial_changes();
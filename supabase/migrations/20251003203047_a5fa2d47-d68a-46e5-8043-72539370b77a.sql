-- ========================================
-- STEP 3: DATABASE QUERY OPTIMIZATION
-- ========================================

-- Add indexes for frequently queried columns

-- Profiles table indexes (for user management)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Audit logs indexes (for admin audit log viewer)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Contact submissions indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- Job postings indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON public.job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_artist_id ON public.job_postings(artist_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Projects indexes (for faster project queries)
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_engineer_id ON public.projects(engineer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Audio files indexes
CREATE INDEX IF NOT EXISTS idx_audio_files_project_id ON public.audio_files(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_uploaded_by ON public.audio_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON public.audio_files(created_at DESC);

-- Battles indexes
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON public.battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_battle_type ON public.battles(battle_type);

-- Battle votes indexes
CREATE INDEX IF NOT EXISTS idx_battle_votes_battle_id ON public.battle_votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_votes_user_id ON public.battle_votes(user_id);

-- Engineer leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_engineer_leaderboard_rank ON public.engineer_leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_engineer_leaderboard_total_earnings ON public.engineer_leaderboard(total_earnings DESC);

-- Chatbot audit logs indexes (for admin security monitoring)
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_logs_admin_id ON public.chatbot_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_logs_created_at ON public.chatbot_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_logs_security_check ON public.chatbot_audit_logs(security_check_passed);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_status_created_at ON public.projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action_created ON public.audit_logs(table_name, action, created_at DESC);
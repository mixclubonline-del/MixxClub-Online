
-- Phase 2: Performance Optimization - Strategic Indexes (Final)
-- Add indexes for commonly queried patterns (92 strategic indexes)

-- =====================================================
-- Core Business Tables - Highest Priority
-- =====================================================

-- Projects table (most queried)
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_engineer_id ON public.projects(engineer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status_engineer ON public.projects(status, engineer_id) WHERE engineer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status_client ON public.projects(status, client_id);

-- Audio files (frequently joined)
CREATE INDEX IF NOT EXISTS idx_audio_files_project_id ON public.audio_files(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_uploaded_by ON public.audio_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_audio_files_job_id ON public.audio_files(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON public.audio_files(created_at DESC);

-- Collaboration
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_host ON public.collaboration_sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_project ON public.collaboration_sessions(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_status ON public.collaboration_sessions(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_comments_project ON public.collaboration_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_comments_user ON public.collaboration_comments(user_id);

-- Payments & Earnings
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engineer_earnings_engineer ON public.engineer_earnings(engineer_id);
CREATE INDEX IF NOT EXISTS idx_engineer_earnings_project ON public.engineer_earnings(project_id);
CREATE INDEX IF NOT EXISTS idx_engineer_earnings_status ON public.engineer_earnings(status);

-- =====================================================
-- User Activity Tables
-- =====================================================

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Chatbot messages
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_user ON public.chatbot_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session ON public.chatbot_messages(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON public.chatbot_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_type ON public.chatbot_messages(chatbot_type);

-- =====================================================
-- Job Board & Applications
-- =====================================================

-- Job postings
CREATE INDEX IF NOT EXISTS idx_job_postings_artist ON public.job_postings(artist_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON public.job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_status_date ON public.job_postings(status, created_at DESC) WHERE status = 'open';

-- Job applications
CREATE INDEX IF NOT EXISTS idx_job_applications_engineer ON public.job_applications(engineer_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- =====================================================
-- Reviews & Ratings
-- =====================================================

-- Project reviews
CREATE INDEX IF NOT EXISTS idx_project_reviews_project ON public.project_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_engineer ON public.project_reviews(engineer_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_artist ON public.project_reviews(artist_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_rating ON public.project_reviews(rating);

-- =====================================================
-- AI & Analysis
-- =====================================================

-- AI audio profiles
CREATE INDEX IF NOT EXISTS idx_ai_audio_profiles_user ON public.ai_audio_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audio_profiles_file ON public.ai_audio_profiles(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_ai_audio_profiles_created ON public.ai_audio_profiles(created_at DESC);

-- AI matches
CREATE INDEX IF NOT EXISTS idx_ai_collaboration_matches_artist ON public.ai_collaboration_matches(artist_id);
CREATE INDEX IF NOT EXISTS idx_ai_collaboration_matches_engineer ON public.ai_collaboration_matches(engineer_id);
CREATE INDEX IF NOT EXISTS idx_ai_collaboration_matches_status ON public.ai_collaboration_matches(match_status);

-- AI mixing suggestions
CREATE INDEX IF NOT EXISTS idx_ai_mixing_suggestions_session ON public.ai_mixing_suggestions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_mixing_suggestions_audio ON public.ai_mixing_suggestions(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_ai_mixing_suggestions_applied ON public.ai_mixing_suggestions(applied);

-- =====================================================
-- Distribution & Music
-- =====================================================

-- Music releases
CREATE INDEX IF NOT EXISTS idx_music_releases_user ON public.music_releases(user_id);
CREATE INDEX IF NOT EXISTS idx_music_releases_project ON public.music_releases(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_releases_status ON public.music_releases(status);
CREATE INDEX IF NOT EXISTS idx_music_releases_date ON public.music_releases(release_date DESC);

-- Distribution analytics
CREATE INDEX IF NOT EXISTS idx_distribution_analytics_user ON public.distribution_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_analytics_release ON public.distribution_analytics(release_id) WHERE release_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_distribution_analytics_date ON public.distribution_analytics(date DESC);

-- =====================================================
-- Battles & Tournaments
-- =====================================================

-- Battles
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON public.battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_event_date ON public.battles(event_date DESC) WHERE event_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_battles_type ON public.battles(battle_type);

-- Battle votes
CREATE INDEX IF NOT EXISTS idx_battle_votes_battle ON public.battle_votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_votes_user ON public.battle_votes(user_id);

-- Battle comments
CREATE INDEX IF NOT EXISTS idx_battle_comments_battle ON public.battle_comments(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_comments_user ON public.battle_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_comments_created ON public.battle_comments(created_at DESC);

-- =====================================================
-- Education & Courses
-- =====================================================

-- Lesson progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON public.lesson_progress(status);

-- =====================================================
-- Performance Monitoring Indexes
-- =====================================================

-- Audit logs for admin queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Session participants for real-time features
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user ON public.session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_active ON public.session_participants(is_active) WHERE is_active = true;

-- =====================================================
-- Additional High-Value Indexes
-- =====================================================

-- Achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_earned ON public.achievements(earned_at DESC);

-- Engineer profiles for directory queries
CREATE INDEX IF NOT EXISTS idx_engineer_profiles_user ON public.engineer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_engineer_profiles_rating ON public.engineer_profiles(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_engineer_profiles_available ON public.engineer_profiles(is_available) WHERE is_available = true;

-- Audio streams for real-time collaboration
CREATE INDEX IF NOT EXISTS idx_audio_streams_session ON public.audio_streams(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audio_streams_user ON public.audio_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_streams_active ON public.audio_streams(is_active) WHERE is_active = true;


-- Phase 3: Monitoring & Maintenance (Final Fix)
-- Database health monitoring and automated cleanup

-- =====================================================
-- 1. Database Health Monitoring View
-- =====================================================

CREATE OR REPLACE VIEW public.database_health_monitor AS
SELECT 
    s.schemaname,
    s.relname as table_name,
    pg_size_pretty(pg_total_relation_size(s.schemaname||'.'||s.relname)) AS total_size,
    pg_total_relation_size(s.schemaname||'.'||s.relname) as size_bytes,
    s.n_live_tup as row_count,
    s.n_dead_tup as dead_rows,
    CASE 
        WHEN s.n_live_tup > 0 
        THEN ROUND(100.0 * s.n_dead_tup / s.n_live_tup, 2)
        ELSE 0 
    END as dead_row_percent,
    s.last_vacuum,
    s.last_autovacuum,
    s.last_analyze,
    s.last_autoanalyze,
    CASE
        WHEN s.last_autovacuum IS NULL AND s.last_vacuum IS NULL THEN 'Never vacuumed'
        WHEN COALESCE(s.last_autovacuum, s.last_vacuum) < now() - interval '7 days' THEN 'Needs vacuum'
        ELSE 'Healthy'
    END as vacuum_status
FROM pg_stat_user_tables s
WHERE s.schemaname = 'public'
ORDER BY pg_total_relation_size(s.schemaname||'.'||s.relname) DESC;

GRANT SELECT ON public.database_health_monitor TO authenticated;

-- =====================================================
-- 2. Automated Cleanup Functions
-- =====================================================

-- Cleanup old chatbot messages (keep last 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_chatbot_messages(days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE (
    deleted_count BIGINT,
    oldest_deleted TIMESTAMP WITH TIME ZONE,
    newest_deleted TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count BIGINT;
    v_oldest TIMESTAMP WITH TIME ZONE;
    v_newest TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT 
        COUNT(*),
        MIN(created_at),
        MAX(created_at)
    INTO v_deleted_count, v_oldest, v_newest
    FROM chatbot_messages
    WHERE created_at < now() - (days_to_keep || ' days')::interval;
    
    DELETE FROM chatbot_messages
    WHERE created_at < now() - (days_to_keep || ' days')::interval;
    
    RETURN QUERY SELECT v_deleted_count, v_oldest, v_newest;
END;
$$;

-- Cleanup old audit logs (keep last 180 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 180)
RETURNS TABLE (
    deleted_count BIGINT,
    oldest_deleted TIMESTAMP WITH TIME ZONE,
    newest_deleted TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count BIGINT;
    v_oldest TIMESTAMP WITH TIME ZONE;
    v_newest TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT 
        COUNT(*),
        MIN(created_at),
        MAX(created_at)
    INTO v_deleted_count, v_oldest, v_newest
    FROM audit_logs
    WHERE created_at < now() - (days_to_keep || ' days')::interval;
    
    DELETE FROM audit_logs
    WHERE created_at < now() - (days_to_keep || ' days')::interval;
    
    RETURN QUERY SELECT v_deleted_count, v_oldest, v_newest;
END;
$$;

-- Cleanup old read notifications (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE (
    deleted_count BIGINT,
    oldest_deleted TIMESTAMP WITH TIME ZONE,
    newest_deleted TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count BIGINT;
    v_oldest TIMESTAMP WITH TIME ZONE;
    v_newest TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT 
        COUNT(*),
        MIN(created_at),
        MAX(created_at)
    INTO v_deleted_count, v_oldest, v_newest
    FROM notifications
    WHERE is_read = true 
    AND created_at < now() - (days_to_keep || ' days')::interval;
    
    DELETE FROM notifications
    WHERE is_read = true 
    AND created_at < now() - (days_to_keep || ' days')::interval;
    
    RETURN QUERY SELECT v_deleted_count, v_oldest, v_newest;
END;
$$;

-- =====================================================
-- 3. Master Cleanup Function
-- =====================================================

CREATE OR REPLACE FUNCTION public.run_maintenance_cleanup()
RETURNS TABLE (
    task_name TEXT,
    records_deleted BIGINT,
    execution_time_ms INTEGER,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_chatbot_deleted BIGINT;
    v_audit_deleted BIGINT;
    v_notif_deleted BIGINT;
BEGIN
    -- Cleanup chatbot messages
    v_start_time := clock_timestamp();
    SELECT deleted_count INTO v_chatbot_deleted 
    FROM cleanup_old_chatbot_messages(90);
    v_end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Cleanup Chatbot Messages'::TEXT,
        v_chatbot_deleted,
        EXTRACT(milliseconds FROM (v_end_time - v_start_time))::INTEGER,
        'Completed'::TEXT;
    
    -- Cleanup audit logs
    v_start_time := clock_timestamp();
    SELECT deleted_count INTO v_audit_deleted 
    FROM cleanup_old_audit_logs(180);
    v_end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Cleanup Audit Logs'::TEXT,
        v_audit_deleted,
        EXTRACT(milliseconds FROM (v_end_time - v_start_time))::INTEGER,
        'Completed'::TEXT;
    
    -- Cleanup notifications
    v_start_time := clock_timestamp();
    SELECT deleted_count INTO v_notif_deleted 
    FROM cleanup_old_notifications(30);
    v_end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Cleanup Old Notifications'::TEXT,
        v_notif_deleted,
        EXTRACT(milliseconds FROM (v_end_time - v_start_time))::INTEGER,
        'Completed'::TEXT;
END;
$$;

-- =====================================================
-- 4. Index Usage Statistics
-- =====================================================

CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    CASE 
        WHEN idx_scan = 0 THEN 'Unused - Consider dropping'
        WHEN idx_scan < 100 THEN 'Low usage'
        WHEN idx_scan < 1000 THEN 'Medium usage'
        ELSE 'High usage'
    END as usage_level
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

GRANT SELECT ON public.index_usage_stats TO authenticated;

-- =====================================================
-- 5. Connection Pool Monitor
-- =====================================================

CREATE OR REPLACE VIEW public.connection_monitor AS
SELECT 
    COUNT(*) as total_connections,
    COUNT(*) FILTER (WHERE state = 'active') as active_connections,
    COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
    COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
    COUNT(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting_connections,
    MAX(EXTRACT(epoch FROM (now() - state_change))) as longest_idle_seconds
FROM pg_stat_activity
WHERE datname = current_database();

GRANT SELECT ON public.connection_monitor TO authenticated;

-- Add helpful comments
COMMENT ON VIEW public.database_health_monitor IS 'Monitor table sizes, row counts, and vacuum status';
COMMENT ON VIEW public.index_usage_stats IS 'Track index usage to identify unused indexes';
COMMENT ON VIEW public.connection_monitor IS 'Monitor database connections and their states';
COMMENT ON FUNCTION public.run_maintenance_cleanup() IS 'Run all maintenance cleanup tasks - recommended to run weekly';
COMMENT ON FUNCTION public.cleanup_old_chatbot_messages(INTEGER) IS 'Remove chatbot messages older than specified days (default 90)';
COMMENT ON FUNCTION public.cleanup_old_audit_logs(INTEGER) IS 'Remove audit logs older than specified days (default 180)';
COMMENT ON FUNCTION public.cleanup_old_notifications(INTEGER) IS 'Remove read notifications older than specified days (default 30)';

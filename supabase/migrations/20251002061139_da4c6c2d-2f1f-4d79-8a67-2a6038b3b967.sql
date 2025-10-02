
-- Fix Security Definer View Warnings
-- Convert monitoring views to SECURITY INVOKER

-- Drop existing views
DROP VIEW IF EXISTS public.database_health_monitor;
DROP VIEW IF EXISTS public.index_usage_stats;
DROP VIEW IF EXISTS public.connection_monitor;

-- Recreate as SECURITY INVOKER (or without explicit security context)
-- These views only expose monitoring data, not user data

CREATE VIEW public.database_health_monitor 
WITH (security_invoker = true) AS
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

CREATE VIEW public.index_usage_stats
WITH (security_invoker = true) AS
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

CREATE VIEW public.connection_monitor
WITH (security_invoker = true) AS
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

COMMENT ON VIEW public.database_health_monitor IS 'Monitor table sizes, row counts, and vacuum status';
COMMENT ON VIEW public.index_usage_stats IS 'Track index usage to identify unused indexes';
COMMENT ON VIEW public.connection_monitor IS 'Monitor database connections and their states';

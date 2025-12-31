-- Drop and recreate the engineer_leaderboard view with security_invoker = true
-- This ensures RLS policies of the querying user are enforced, not the view owner

DROP VIEW IF EXISTS public.engineer_leaderboard;

CREATE VIEW public.engineer_leaderboard
WITH (security_invoker = true)
AS
SELECT 
    user_id,
    id AS engineer_id,
    row_number() OVER (ORDER BY (
        (COALESCE(rating, 0::numeric) * 0.4) + 
        (COALESCE(completed_projects, 0)::numeric * 0.3) + 
        (COALESCE((SELECT sum(engineer_earnings.amount) FROM engineer_earnings WHERE engineer_earnings.engineer_id = ep.user_id), 0::numeric) * 0.3)
    ) DESC) AS rank,
    rating AS average_rating,
    completed_projects,
    COALESCE((SELECT sum(engineer_earnings.amount) FROM engineer_earnings WHERE engineer_earnings.engineer_id = ep.user_id), 0::numeric) AS total_earnings
FROM engineer_profiles ep;
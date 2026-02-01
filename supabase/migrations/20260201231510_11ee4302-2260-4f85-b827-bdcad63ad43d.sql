
-- Fix the SECURITY DEFINER view warning by recreating as SECURITY INVOKER
DROP VIEW IF EXISTS public.streaming_connections_safe;

CREATE VIEW public.streaming_connections_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  platform,
  connection_status,
  expires_at,
  profile_data,
  created_at,
  updated_at
  -- Explicitly EXCLUDE: access_token, refresh_token
FROM public.streaming_connections;

-- Grant access to the safe view
GRANT SELECT ON public.streaming_connections_safe TO authenticated;

-- Add comment documenting the security measure
COMMENT ON VIEW public.streaming_connections_safe IS 
  'Safe view of streaming_connections that excludes sensitive tokens. Uses SECURITY INVOKER to respect RLS policies.';

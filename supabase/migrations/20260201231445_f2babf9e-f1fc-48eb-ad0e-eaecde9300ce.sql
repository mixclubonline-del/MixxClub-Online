
-- FIX: streaming_connections - Create safe view without tokens
-- The table already has proper RLS (user_id = auth.uid()), 
-- but we ensure tokens aren't accidentally exposed via SELECT *
-- by creating a safe view for general use

CREATE OR REPLACE VIEW public.streaming_connections_safe AS
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
  'Safe view of streaming_connections that excludes sensitive tokens. Use this view instead of querying the table directly.';

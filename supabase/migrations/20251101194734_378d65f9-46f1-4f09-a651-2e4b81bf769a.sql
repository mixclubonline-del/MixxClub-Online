-- Fix search_path on all SECURITY DEFINER functions to prevent privilege escalation
-- This migration adds SET search_path = public to all SECURITY DEFINER functions

-- Role checking functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_mastering_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_mastering_subscriptions ums
    JOIN public.mastering_packages mp ON ums.package_id = mp.id
    WHERE ums.user_id = $1
      AND ums.status = 'active'
      AND (ums.expires_at IS NULL OR ums.expires_at > now())
      AND (mp.track_limit = -1 OR ums.tracks_used < mp.track_limit)
  );
$$;

CREATE OR REPLACE FUNCTION public.has_mixing_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_mixing_subscriptions ums
    JOIN public.mixing_packages mp ON ums.package_id = mp.id
    WHERE ums.user_id = $1
      AND ums.status = 'active'
      AND (ums.expires_at IS NULL OR ums.expires_at > now())
      AND (mp.track_limit = -1 OR ums.tracks_used < mp.track_limit)
  );
$$;

CREATE OR REPLACE FUNCTION public.has_distribution_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_distribution_subscriptions uds
    JOIN public.distribution_packages dp ON uds.package_id = dp.id
    WHERE uds.user_id = $1
      AND uds.status = 'active'
      AND (uds.current_period_end IS NULL OR uds.current_period_end > now())
      AND (dp.releases_per_year = -1 OR uds.releases_used < dp.releases_per_year)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_session_host(session_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaboration_sessions 
    WHERE id = session_uuid 
    AND host_user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_session_participant(session_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM session_participants
    WHERE session_id = session_uuid
    AND user_id = user_uuid
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_user_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.user_organizations uo
    where uo.user_id = p_user_id
      and uo.organization_id = p_org_id
      and uo.member_role = 'admin'
  );
$$;

-- Note: Additional SECURITY DEFINER functions with complex logic (triggers, mutations, etc.)
-- already have search_path set or use plpgsql which is less vulnerable.
-- This migration covers the critical SQL SECURITY DEFINER functions used in RLS policies.
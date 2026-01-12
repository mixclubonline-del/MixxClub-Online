-- The public_profiles view was already created in the partial migration
-- Now just fix the RLS policies

-- Drop the overly permissive policy that exposes emails
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;

-- Drop existing policies to avoid conflicts (we'll recreate proper ones)
DROP POLICY IF EXISTS "Partners can view collaborator profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create partnership-based access policy
CREATE POLICY "Partners can view collaborator profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partnerships p
    WHERE p.status = 'active'
    AND (
      (p.artist_id = auth.uid() AND p.engineer_id = profiles.id)
      OR (p.engineer_id = auth.uid() AND p.artist_id = profiles.id)
    )
  )
);

-- Admin access policy
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
-- ========================================
-- CRITICAL SECURITY FIX: Role-Based Access Control
-- ========================================

-- 1. Create user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'moderator', 'engineer', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 5. CRITICAL: Prevent users from updating their own role in profiles table
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their profile (except role)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role changes by comparing with existing row
  (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
);

-- 6. Allow admins to update any profile including roles
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 7. Insert demo admin into user_roles if not exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::user_role
FROM auth.users
WHERE email = 'mixclubonline@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Add helpful comments
COMMENT ON TABLE public.user_roles IS 'Stores user roles for authorization. Uses security definer functions to prevent RLS recursion. Roles should ONLY be managed through this table for security.';
COMMENT ON COLUMN public.profiles.role IS 'DISPLAY ONLY - Do not use for authorization! Use user_roles table and has_role() function instead.';

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
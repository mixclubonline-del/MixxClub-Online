-- Tighten RLS policies for security hardening

-- 1. ai_collaboration_matches - Require project ownership or admin role
DROP POLICY IF EXISTS "System can create matches" ON public.ai_collaboration_matches;

CREATE POLICY "Project owners and admins can create matches" 
ON public.ai_collaboration_matches 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = ai_collaboration_matches.project_id 
    AND projects.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- 2. matches - Require user to be artist or engineer participant
DROP POLICY IF EXISTS "System can create matches" ON public.matches;

CREATE POLICY "Participants can create matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (artist_id = auth.uid() OR engineer_id = auth.uid())
);

-- 3. revenue_streams - Restrict to owner or admins (uses user_id column)
DROP POLICY IF EXISTS "System can create revenue streams" ON public.revenue_streams;

CREATE POLICY "Owners and admins can create revenue streams"
ON public.revenue_streams
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);
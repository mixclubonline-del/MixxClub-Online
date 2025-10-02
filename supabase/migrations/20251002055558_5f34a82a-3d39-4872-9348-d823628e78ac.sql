
-- Phase 1: Security Hardening (Revised)
-- Fix RLS policies and function search paths

-- =====================================================
-- 1. Fix Function Search Paths
-- =====================================================

-- Fix is_org_admin function
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

-- Fix update_chatbot_messages_updated_at function
CREATE OR REPLACE FUNCTION public.update_chatbot_messages_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 2. Add RLS Policies for ai_mixing_suggestions
-- =====================================================

-- Users can view suggestions for sessions they participate in
CREATE POLICY "Users can view suggestions for their sessions"
ON public.ai_mixing_suggestions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_sessions cs
    WHERE cs.id = ai_mixing_suggestions.session_id
    AND (cs.host_user_id = auth.uid() OR is_session_participant(cs.id, auth.uid()))
  )
);

-- System can insert AI suggestions
CREATE POLICY "System can insert AI suggestions"
ON public.ai_mixing_suggestions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own feedback on suggestions
CREATE POLICY "Users can update suggestion feedback"
ON public.ai_mixing_suggestions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_sessions cs
    WHERE cs.id = ai_mixing_suggestions.session_id
    AND (cs.host_user_id = auth.uid() OR is_session_participant(cs.id, auth.uid()))
  )
);

-- =====================================================
-- 3. Add RLS Policies for course_lessons
-- =====================================================

-- Everyone can view published course lessons
CREATE POLICY "Everyone can view published course lessons"
ON public.course_lessons
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_lessons.course_id
    AND (c.is_published = true OR c.instructor_id = auth.uid())
  )
);

-- Instructors can manage their course lessons
CREATE POLICY "Instructors can manage their course lessons"
ON public.course_lessons
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_lessons.course_id
    AND c.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_lessons.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- =====================================================
-- 4. Add RLS Policies for course_reviews
-- =====================================================

-- Everyone can view course reviews
CREATE POLICY "Everyone can view course reviews"
ON public.course_reviews
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create reviews (one per course)
CREATE POLICY "Users can create reviews"
ON public.course_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.course_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.course_reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Phase 12: Complete Education System
-- Add missing tables for certificates and lesson progress

-- Create certificates table for course completion
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.course_enrollments(id) ON DELETE SET NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_completions table for tracking individual lesson progress
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_time_seconds INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(user_id, lesson_id)
);

-- Create course_reviews table for student feedback
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- Certificates policies
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all certificates"
  ON public.certificates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Lesson completions policies
CREATE POLICY "Users can view their own lesson completions"
  ON public.lesson_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark lessons complete"
  ON public.lesson_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON public.lesson_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Course reviews policies
CREATE POLICY "Everyone can view public reviews"
  ON public.course_reviews FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own reviews"
  ON public.course_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews for enrolled courses"
  ON public.course_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.course_enrollments WHERE user_id = auth.uid() AND course_id = course_reviews.course_id)
  );

CREATE POLICY "Users can update their own reviews"
  ON public.course_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_course ON public.lesson_completions(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON public.course_reviews(course_id);

-- Function to auto-update enrollment progress when lesson is completed
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_progress NUMERIC;
BEGIN
  -- Count total lessons in course
  SELECT COUNT(*) INTO v_total_lessons
  FROM lessons WHERE course_id = NEW.course_id;
  
  -- Count completed lessons by user
  SELECT COUNT(*) INTO v_completed_lessons
  FROM lesson_completions 
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
  
  -- Calculate progress percentage
  v_progress := CASE WHEN v_total_lessons > 0 
    THEN (v_completed_lessons::NUMERIC / v_total_lessons::NUMERIC) * 100 
    ELSE 0 END;
  
  -- Update enrollment
  UPDATE course_enrollments
  SET 
    progress_percentage = v_progress,
    last_accessed_lesson_id = NEW.lesson_id,
    completed_at = CASE WHEN v_progress >= 100 THEN now() ELSE NULL END
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
  
  -- Award XP for lesson completion
  PERFORM award_points(NEW.user_id, 15, 'lesson_completed', 'Completed a lesson');
  
  RETURN NEW;
END;
$$;

-- Trigger for auto-progress update
DROP TRIGGER IF EXISTS on_lesson_completed ON public.lesson_completions;
CREATE TRIGGER on_lesson_completed
  AFTER INSERT ON public.lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_progress();

-- Function to issue certificate on course completion
CREATE OR REPLACE FUNCTION public.issue_course_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cert_number TEXT;
BEGIN
  -- Only issue if course is now 100% complete and no certificate exists
  IF NEW.progress_percentage >= 100 AND NEW.completed_at IS NOT NULL THEN
    -- Check if certificate already issued
    IF NOT EXISTS (SELECT 1 FROM certificates WHERE user_id = NEW.user_id AND course_id = NEW.course_id) THEN
      -- Generate unique certificate number
      v_cert_number := 'CERT-' || UPPER(SUBSTRING(MD5(NEW.id::text || now()::text) FROM 1 FOR 8));
      
      INSERT INTO certificates (user_id, course_id, enrollment_id, certificate_number)
      VALUES (NEW.user_id, NEW.course_id, NEW.id, v_cert_number);
      
      -- Update enrollment
      UPDATE course_enrollments SET certificate_issued = true WHERE id = NEW.id;
      
      -- Award XP for course completion
      PERFORM award_points(NEW.user_id, 200, 'course_completed', 'Completed a course');
      
      -- Award achievement
      INSERT INTO achievements (user_id, achievement_type, title, description, icon, badge_name, badge_type)
      VALUES (
        NEW.user_id, 
        'course_completed', 
        'Knowledge Seeker', 
        'Completed your first course!', 
        'graduation-cap', 
        'Graduate', 
        'milestone'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for certificate issuance
DROP TRIGGER IF EXISTS on_course_completed ON public.course_enrollments;
CREATE TRIGGER on_course_completed
  AFTER UPDATE OF progress_percentage ON public.course_enrollments
  FOR EACH ROW
  WHEN (NEW.progress_percentage >= 100)
  EXECUTE FUNCTION public.issue_course_certificate();
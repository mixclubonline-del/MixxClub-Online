-- Add new columns to courses table for full course functionality
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'pro' CHECK (tier IN ('free', 'pro', 'studio')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS outcomes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS total_enrollments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0;

-- Create lesson_progress table for tracking individual lesson progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  watched_duration INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_courses_published_tier ON courses(is_published, tier) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_stripe_price ON courses(stripe_price_id) WHERE stripe_price_id IS NOT NULL;

-- Enable RLS on lesson_progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own lesson progress
CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress
  FOR SELECT USING (
    enrollment_id IN (
      SELECT id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own lesson progress
CREATE POLICY "Users can insert own lesson progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (
    enrollment_id IN (
      SELECT id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );

-- Users can update their own lesson progress
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress
  FOR UPDATE USING (
    enrollment_id IN (
      SELECT id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );

-- Function to increment course enrollments
CREATE OR REPLACE FUNCTION public.increment_course_enrollments(p_course_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE courses 
  SET total_enrollments = total_enrollments + 1
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to recalculate course rating from reviews
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM course_reviews
    WHERE course_id = NEW.course_id AND is_public = true
  )
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-update course rating when reviews change
DROP TRIGGER IF EXISTS trigger_update_course_rating ON course_reviews;
CREATE TRIGGER trigger_update_course_rating
  AFTER INSERT OR UPDATE ON course_reviews
  FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- Add realtime for lesson_progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
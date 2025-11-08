-- Premium Courses System Database Schema
-- Tables for course management, enrollment, progress tracking, and certificates

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('production', 'mixing', 'mastering', 'business', 'marketing')),
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('pro', 'studio')),
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  thumbnail VARCHAR(255),
  duration INTEGER DEFAULT 0, -- in hours
  total_lessons INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  outcomes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_price CHECK (price >= 0)
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  lesson_order INTEGER NOT NULL,
  resources TEXT[] DEFAULT '{}',
  quiz JSONB, -- { id, questions, passingScore }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, lesson_order)
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  lessons_completed UUID[] DEFAULT '{}',
  current_lesson UUID REFERENCES lessons(id),
  certificate_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  watched_duration INTEGER DEFAULT 0, -- in seconds
  quiz_score DECIMAL(5, 2),
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(enrollment_id, lesson_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(enrollment_id)
);

-- Create course_ratings table for reviews
CREATE TABLE IF NOT EXISTS course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, user_id)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_tier ON courses(tier);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, lesson_order);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(completed_at);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(completed_at);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment ON certificates(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_course_ratings_course ON course_ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_ratings_user ON course_ratings(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read, admin write)
CREATE POLICY "Courses are publicly readable" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Only instructors can update their courses" ON courses
  FOR UPDATE USING (auth.uid() = instructor_id);

-- RLS Policies for enrollments (users can only see their own)
CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view their lesson progress" ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = lesson_progress.enrollment_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their lesson progress" ON lesson_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = lesson_progress.enrollment_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- RLS Policies for certificates
CREATE POLICY "Users can view their certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for ratings
CREATE POLICY "Anyone can view course ratings" ON course_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings" ON course_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update course progress when a lesson is completed
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INT;
  completed_lessons INT;
  new_progress INT;
BEGIN
  -- Get total lessons for the course
  SELECT COUNT(*) INTO total_lessons
  FROM lessons
  WHERE course_id = (
    SELECT course_id FROM enrollments WHERE id = NEW.enrollment_id
  );

  -- Count completed lessons for this enrollment
  SELECT COUNT(*) INTO completed_lessons
  FROM lesson_progress
  WHERE enrollment_id = NEW.enrollment_id
  AND completed_at IS NOT NULL;

  -- Calculate progress percentage
  IF total_lessons > 0 THEN
    new_progress := ROUND((completed_lessons::FLOAT / total_lessons) * 100);
  ELSE
    new_progress := 0;
  END IF;

  -- Update enrollment progress
  UPDATE enrollments
  SET progress = new_progress,
      updated_at = CURRENT_TIMESTAMP,
      completed_at = CASE 
        WHEN new_progress = 100 THEN CURRENT_TIMESTAMP
        ELSE completed_at
      END
  WHERE id = NEW.enrollment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lesson_progress updates
CREATE TRIGGER trigger_update_enrollment_progress
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_progress();

-- Function to update course rating when new rating is added
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
  count_ratings INT;
BEGIN
  -- Calculate average rating
  SELECT AVG(rating)::DECIMAL(3,2), COUNT(*) INTO avg_rating, count_ratings
  FROM course_ratings
  WHERE course_id = NEW.course_id;

  -- Update course
  UPDATE courses
  SET rating = COALESCE(avg_rating, 0),
      review_count = count_ratings,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for course ratings
CREATE TRIGGER trigger_update_course_rating
AFTER INSERT OR UPDATE ON course_ratings
FOR EACH ROW
EXECUTE FUNCTION update_course_rating();

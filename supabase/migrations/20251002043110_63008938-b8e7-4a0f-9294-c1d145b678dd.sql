-- Tier 2: Knowledge Center & Advanced Collaboration 2.0 (Fixed)
-- Educational Hub Tables

-- Instructor profiles
CREATE TABLE IF NOT EXISTS public.instructor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  total_students INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES public.instructor_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  prerequisites TEXT[] DEFAULT '{}',
  learning_outcomes TEXT[] DEFAULT '{}',
  total_lessons INTEGER DEFAULT 0,
  total_enrollments INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  content_type TEXT NOT NULL DEFAULT 'video',
  content_data JSONB DEFAULT '{}',
  resources JSONB DEFAULT '[]',
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, lesson_number)
);

-- User course enrollments
CREATE TABLE IF NOT EXISTS public.user_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  certificate_issued BOOLEAN DEFAULT false,
  certificate_id UUID,
  UNIQUE(user_id, course_id)
);

-- User lesson progress (renamed to avoid conflict)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES public.user_enrollments(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  certification_name TEXT NOT NULL,
  description TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  verification_code TEXT UNIQUE,
  skills_verified TEXT[] DEFAULT '{}',
  assessment_scores JSONB DEFAULT '{}',
  certificate_url TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Course reviews
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Voice commands log
CREATE TABLE IF NOT EXISTS public.voice_commands_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  command_text TEXT NOT NULL,
  command_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  executed_successfully BOOLEAN DEFAULT true,
  error_message TEXT,
  audio_file_id UUID REFERENCES public.audio_files(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processing_time_ms INTEGER
);

-- AI mixing suggestions
CREATE TABLE IF NOT EXISTS public.ai_mixing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE NOT NULL,
  audio_file_id UUID REFERENCES public.audio_files(id) NOT NULL,
  suggestion_type TEXT NOT NULL,
  suggestion_title TEXT NOT NULL,
  suggestion_description TEXT,
  confidence_score NUMERIC,
  parameters JSONB DEFAULT '{}',
  applied BOOLEAN DEFAULT false,
  applied_by UUID REFERENCES auth.users(id),
  applied_at TIMESTAMP WITH TIME ZONE,
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_mixing_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only if not exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'instructor_profiles' AND policyname = 'Everyone can view verified instructors') THEN
    CREATE POLICY "Everyone can view verified instructors"
      ON public.instructor_profiles FOR SELECT
      USING (is_verified = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'instructor_profiles' AND policyname = 'Instructors can manage their own profile') THEN
    CREATE POLICY "Instructors can manage their own profile"
      ON public.instructor_profiles FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'instructor_profiles' AND policyname = 'Admins can manage all instructor profiles') THEN
    CREATE POLICY "Admins can manage all instructor profiles"
      ON public.instructor_profiles FOR ALL
      USING (is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Everyone can view published courses') THEN
    CREATE POLICY "Everyone can view published courses"
      ON public.courses FOR SELECT
      USING (is_published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_enrollments' AND policyname = 'Users can view their own enrollments') THEN
    CREATE POLICY "Users can view their own enrollments"
      ON public.user_enrollments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_enrollments' AND policyname = 'Users can enroll in courses') THEN
    CREATE POLICY "Users can enroll in courses"
      ON public.user_enrollments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_progress' AND policyname = 'Users can manage their own progress') THEN
    CREATE POLICY "Users can manage their own progress"
      ON public.lesson_progress FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certifications' AND policyname = 'Users can view their own certifications') THEN
    CREATE POLICY "Users can view their own certifications"
      ON public.certifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_commands_log' AND policyname = 'Users can log their own commands') THEN
    CREATE POLICY "Users can log their own commands"
      ON public.voice_commands_log FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user ON public.user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_session ON public.voice_commands_log(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_session ON public.ai_mixing_suggestions(session_id);

-- Tier 2 milestone
INSERT INTO public.community_milestones (
  feature_key,
  milestone_name,
  milestone_description,
  milestone_type,
  target_value,
  current_value,
  display_order,
  icon_name,
  reward_description
) VALUES (
  'TIER_2_EDUCATION_COLLAB',
  'Tier 2: Knowledge Center',
  'Unlock educational courses, certifications, and advanced collaboration',
  'user_count',
  250,
  0,
  2,
  'graduation-cap',
  'Educational Hub, Certifications, Voice Commands, AI Mixing Suggestions'
) ON CONFLICT (feature_key) DO NOTHING;
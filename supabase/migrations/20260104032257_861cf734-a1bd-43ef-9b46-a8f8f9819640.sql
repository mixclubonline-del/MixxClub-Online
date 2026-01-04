-- Email Sequences for Drip Campaigns
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  trigger_event TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email Sequence Steps
CREATE TABLE IF NOT EXISTS public.email_sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_hours INTEGER DEFAULT 0,
  subject TEXT NOT NULL,
  html_template TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email Sequence Enrollments
CREATE TABLE IF NOT EXISTS public.email_sequence_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_email_at TIMESTAMPTZ,
  next_email_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, sequence_id)
);

-- Enable RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies for email_sequences (admin read-only for now, edge functions use service role)
CREATE POLICY "Allow read access for authenticated users" ON public.email_sequences
  FOR SELECT USING (true);

-- Policies for email_sequence_steps
CREATE POLICY "Allow read access for authenticated users" ON public.email_sequence_steps
  FOR SELECT USING (true);

-- Policies for email_sequence_enrollments
CREATE POLICY "Users can view their own enrollments" ON public.email_sequence_enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_sequence_steps_order ON public.email_sequence_steps(sequence_id, step_order);
CREATE INDEX IF NOT EXISTS idx_enrollments_next_email ON public.email_sequence_enrollments(next_email_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.email_sequence_enrollments(user_id);

-- Seed starter sequences
INSERT INTO public.email_sequences (name, description, trigger_event) VALUES
  ('artist_onboarding', 'Welcome sequence for new artists', 'user.signup'),
  ('engineer_activation', 'Activation sequence for new engineers', 'engineer.verified'),
  ('re_engagement', 'Re-engage inactive users', 'user.inactive')
ON CONFLICT (name) DO NOTHING;

-- Seed artist onboarding steps
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, html_template)
SELECT s.id, step.step_order, step.delay_hours, step.subject, step.html_template
FROM public.email_sequences s
CROSS JOIN (VALUES
  (1, 0, 'Welcome to MixClub! 🎵', '<h1>Welcome to MixClub, {{full_name}}!</h1><p>We''re excited to have you join our community of artists and engineers.</p>'),
  (2, 24, 'Upload Your First Track 🎤', '<h1>Ready to drop your first track?</h1><p>Upload your audio and get matched with top engineers.</p>'),
  (3, 72, 'Meet Our Engineers 🎛️', '<h1>Discover Amazing Talent</h1><p>Browse our vetted engineers ready to elevate your sound.</p>'),
  (4, 120, 'Your First Session Awaits 🚀', '<h1>Book Your First Session</h1><p>Take your music to the next level with a professional session.</p>'),
  (5, 168, 'Special Offer Inside! 🎁', '<h1>Exclusive First-Timer Discount</h1><p>Get 20% off your first project. Code: WELCOME20</p>')
) AS step(step_order, delay_hours, subject, html_template)
WHERE s.name = 'artist_onboarding'
ON CONFLICT DO NOTHING;
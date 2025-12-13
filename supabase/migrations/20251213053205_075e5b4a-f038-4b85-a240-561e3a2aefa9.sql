-- Create demo_beats table to store AI-generated demo content
CREATE TABLE public.demo_beats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL DEFAULT 'trap',
  mood TEXT NOT NULL DEFAULT 'energetic',
  bpm INTEGER DEFAULT 140,
  intensity INTEGER DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  audio_url TEXT,
  storage_path TEXT,
  duration_seconds INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  ai_prompt TEXT,
  generation_model TEXT DEFAULT 'suno',
  created_by TEXT DEFAULT 'prime',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_beats ENABLE ROW LEVEL SECURITY;

-- Everyone can view demo beats (they're demo content)
CREATE POLICY "Anyone can view demo beats"
ON public.demo_beats
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage demo beats"
ON public.demo_beats
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for common queries
CREATE INDEX idx_demo_beats_genre ON public.demo_beats(genre);
CREATE INDEX idx_demo_beats_featured ON public.demo_beats(is_featured);
CREATE INDEX idx_demo_beats_created ON public.demo_beats(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_demo_beats_updated_at
BEFORE UPDATE ON public.demo_beats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
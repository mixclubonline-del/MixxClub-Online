
-- Add genre column to profiles (simple text, alongside existing genre_specialties JSON)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS genre TEXT DEFAULT NULL;

-- Add completed_at to projects (timestamp for when project was completed)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL;

-- Add name column to achievements (display name, alongside existing badge_name/title)
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS name TEXT DEFAULT NULL;

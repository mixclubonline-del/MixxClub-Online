-- Add metadata column to projects table to store additional project information
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
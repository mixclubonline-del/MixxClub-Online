-- Make project_id nullable for standalone premieres
ALTER TABLE public.premieres ALTER COLUMN project_id DROP NOT NULL;
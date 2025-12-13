-- Drop foreign key constraint on artist_id so we can use demo UUIDs
ALTER TABLE public.premieres DROP CONSTRAINT IF EXISTS premieres_user_id_fkey;
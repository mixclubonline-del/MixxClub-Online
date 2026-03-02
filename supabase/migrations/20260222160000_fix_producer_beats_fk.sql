-- Drop the existing foreign key constraint
ALTER TABLE public.producer_beats
DROP CONSTRAINT IF EXISTS producer_beats_producer_id_fkey;

-- Add the new foreign key referencing public.profiles
ALTER TABLE public.producer_beats
ADD CONSTRAINT producer_beats_producer_id_fkey
FOREIGN KEY (producer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

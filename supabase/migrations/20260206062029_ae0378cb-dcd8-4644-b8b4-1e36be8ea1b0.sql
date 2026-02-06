-- Drop the existing check constraint
ALTER TABLE unlockables DROP CONSTRAINT unlockables_unlock_type_check;

-- Add the updated check constraint with producer and fan
ALTER TABLE unlockables ADD CONSTRAINT unlockables_unlock_type_check 
  CHECK (unlock_type = ANY (ARRAY['community'::text, 'artist'::text, 'engineer'::text, 'producer'::text, 'fan'::text]));
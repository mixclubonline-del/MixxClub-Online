-- Add missing columns to match component expectations

-- Add columns to collaboration_sessions
ALTER TABLE collaboration_sessions 
ADD COLUMN IF NOT EXISTS audio_quality TEXT DEFAULT 'high',
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS session_state JSONB;

-- Add columns to session_invitations
ALTER TABLE session_invitations
ADD COLUMN IF NOT EXISTS artist_id UUID,
ADD COLUMN IF NOT EXISTS engineer_id UUID;

-- Update existing session_invitations to use the new columns
-- (Copy inviter_id to artist_id for existing records)
UPDATE session_invitations 
SET artist_id = inviter_id 
WHERE artist_id IS NULL;

-- Add column to session_join_requests
ALTER TABLE session_join_requests
ADD COLUMN IF NOT EXISTS engineer_id UUID;

-- Update existing session_join_requests to use the new column
UPDATE session_join_requests 
SET engineer_id = user_id 
WHERE engineer_id IS NULL;

-- Add project_id foreign key to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_project_id_fkey'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;
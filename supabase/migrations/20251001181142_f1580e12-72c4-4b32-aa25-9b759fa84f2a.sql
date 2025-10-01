-- Add missing columns to project_reviews table
ALTER TABLE project_reviews 
ADD COLUMN IF NOT EXISTS artist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS engineer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS communication_rating numeric CHECK (communication_rating >= 1 AND communication_rating <= 5),
ADD COLUMN IF NOT EXISTS quality_rating numeric CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS timeliness_rating numeric CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
ADD COLUMN IF NOT EXISTS would_recommend boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update existing records to set artist_id and engineer_id from reviewer_id and reviewed_id
UPDATE project_reviews
SET 
  artist_id = reviewer_id,
  engineer_id = reviewed_id
WHERE artist_id IS NULL OR engineer_id IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_project_reviews_artist ON project_reviews(artist_id);

-- Change rating column from integer to numeric
ALTER TABLE project_reviews ALTER COLUMN rating TYPE numeric USING rating::numeric;
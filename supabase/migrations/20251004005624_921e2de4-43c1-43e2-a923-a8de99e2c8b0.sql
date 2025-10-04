-- Add missing columns to job_postings
ALTER TABLE job_postings 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Remote',
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24;

-- Add response time tracking to engineer_profiles
ALTER TABLE engineer_profiles 
ADD COLUMN IF NOT EXISTS response_time_avg_hours INTEGER DEFAULT 24;
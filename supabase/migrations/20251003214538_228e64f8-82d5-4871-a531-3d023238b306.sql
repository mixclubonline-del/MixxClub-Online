-- Step 13: Notification System Enhancement
-- Add notification preferences column to profiles

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "email_notifications": true,
    "push_notifications": true,
    "in_app_notifications": true,
    "project_updates": true,
    "payment_notifications": true,
    "message_notifications": true,
    "marketing_emails": false,
    "weekly_digest": true
  }'::jsonb;
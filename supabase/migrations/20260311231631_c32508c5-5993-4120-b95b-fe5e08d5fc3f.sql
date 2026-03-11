
-- Add per-category, per-channel columns to notification_preferences
-- Each category gets 3 channel toggles: email, push, in_app

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS partnerships_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS partnerships_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS partnerships_in_app boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS payments_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS payments_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS payments_in_app boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS projects_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS projects_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS projects_in_app boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS messages_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS messages_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS messages_in_app boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS health_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS health_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS health_in_app boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS marketing_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weekly_digest_email boolean NOT NULL DEFAULT true;

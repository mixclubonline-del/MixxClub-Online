-- Create push_tokens table for storing device push notification tokens
CREATE TABLE public.push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push tokens
CREATE POLICY "Users can view own push tokens" 
  ON public.push_tokens FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens" 
  ON public.push_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens" 
  ON public.push_tokens FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens" 
  ON public.push_tokens FOR DELETE 
  USING (auth.uid() = user_id);

-- Add notification_preferences column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email_notifications": true, "push_notifications": true}'::jsonb;
  END IF;
END $$;

-- Index for faster lookups
CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);
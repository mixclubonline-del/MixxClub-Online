-- Direct Messaging System for Artist-Engineer Collaboration
-- This migration creates the direct_messages table for real-time messaging

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraints to prevent self-messaging
  CONSTRAINT no_self_messaging CHECK (sender_id != recipient_id),
  
  -- Index for faster queries
  CONSTRAINT valid_message CHECK (
    (message_text IS NOT NULL AND LENGTH(message_text) > 0) OR file_url IS NOT NULL
  )
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id 
  ON direct_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id 
  ON direct_messages(recipient_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
  ON direct_messages(
    LEAST(sender_id, recipient_id),
    GREATEST(sender_id, recipient_id),
    created_at DESC
  );

CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at 
  ON direct_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_direct_messages_unread
  ON direct_messages(recipient_id, read_at)
  WHERE read_at IS NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own messages
CREATE POLICY "Users can view their messages"
  ON direct_messages
  FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- RLS Policy: Users can only send messages (insert)
CREATE POLICY "Users can send messages"
  ON direct_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND sender_id != recipient_id
  );

-- RLS Policy: Users can only update their received messages (mark as read)
CREATE POLICY "Users can mark their messages as read"
  ON direct_messages
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- RLS Policy: Users can only delete their own sent messages
CREATE POLICY "Users can delete their sent messages"
  ON direct_messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_direct_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER direct_messages_updated_at
  BEFORE UPDATE ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_direct_messages_updated_at();

-- Create function to get conversations with last message and unread count
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE (
  conversation_id TEXT,
  other_user_id UUID,
  other_user_display_name TEXT,
  other_user_avatar_url TEXT,
  last_message_text TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (
      LEAST(sender_id, recipient_id),
      GREATEST(sender_id, recipient_id)
    )
      sender_id,
      recipient_id,
      message_text,
      created_at,
      read_at
    FROM direct_messages
    WHERE sender_id = user_id OR recipient_id = user_id
    ORDER BY 
      LEAST(sender_id, recipient_id),
      GREATEST(sender_id, recipient_id),
      created_at DESC
  ),
  conversation_data AS (
    SELECT
      LEAST(dm.sender_id, dm.recipient_id)::text || '-' || 
      GREATEST(dm.sender_id, dm.recipient_id)::text AS conv_id,
      CASE 
        WHEN dm.sender_id = user_id THEN dm.recipient_id
        ELSE dm.sender_id
      END AS other_id,
      dm.message_text,
      dm.created_at,
      COUNT(*) FILTER (WHERE dm.recipient_id = user_id AND dm.read_at IS NULL) OVER (
        PARTITION BY LEAST(dm.sender_id, dm.recipient_id), GREATEST(dm.sender_id, dm.recipient_id)
      ) AS unread
    FROM latest_messages dm
  )
  SELECT
    cd.conv_id,
    cd.other_id,
    p.display_name,
    p.avatar_url,
    cd.message_text,
    cd.created_at,
    cd.unread
  FROM conversation_data cd
  LEFT JOIN profiles p ON p.id = cd.other_id
  ORDER BY cd.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*)
  FROM direct_messages
  WHERE recipient_id = user_id AND read_at IS NULL;
$$ LANGUAGE sql;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_user_conversations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_message_count(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE direct_messages IS 'Stores direct messages between artists and engineers for real-time collaboration';
COMMENT ON COLUMN direct_messages.sender_id IS 'The user sending the message';
COMMENT ON COLUMN direct_messages.recipient_id IS 'The user receiving the message';
COMMENT ON COLUMN direct_messages.message_text IS 'The message content';
COMMENT ON COLUMN direct_messages.file_url IS 'URL to attached file (audio, document, etc)';
COMMENT ON COLUMN direct_messages.read_at IS 'Timestamp when recipient read the message';

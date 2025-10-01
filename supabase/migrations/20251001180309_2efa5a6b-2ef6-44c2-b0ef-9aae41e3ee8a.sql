-- Phase 2.1: Real-Time Notifications System
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  related_id uuid,
  related_type text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  project_updates boolean DEFAULT true,
  payment_notifications boolean DEFAULT true,
  collaboration_invites boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
ON notification_preferences FOR ALL
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_action_url text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, action_url, 
    related_id, related_type, metadata
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_action_url,
    p_related_id, p_related_type, p_metadata
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Triggers for automatic notifications
-- Payment received notification
CREATE OR REPLACE FUNCTION notify_payment_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  engineer_id uuid;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT p.engineer_id INTO engineer_id
    FROM projects p
    WHERE p.id = NEW.project_id;
    
    IF engineer_id IS NOT NULL THEN
      PERFORM create_notification(
        engineer_id,
        'payment_received',
        'Payment Received',
        'You received a payment of $' || NEW.amount::text,
        '/engineer-crm?tab=business',
        NEW.id,
        'payment',
        jsonb_build_object('amount', NEW.amount, 'project_id', NEW.project_id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_payment_received ON payments;
CREATE TRIGGER trigger_notify_payment_received
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_received();

-- Project status change notification
CREATE OR REPLACE FUNCTION notify_project_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Notify client
    PERFORM create_notification(
      NEW.client_id,
      'project_update',
      'Project Status Updated',
      'Your project status changed to ' || NEW.status,
      '/artist-crm',
      NEW.id,
      'project',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
    
    -- Notify engineer if assigned
    IF NEW.engineer_id IS NOT NULL THEN
      PERFORM create_notification(
        NEW.engineer_id,
        'project_update',
        'Project Status Updated',
        'Project status changed to ' || NEW.status,
        '/engineer-crm',
        NEW.id,
        'project',
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_project_status_change ON projects;
CREATE TRIGGER trigger_notify_project_status_change
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_project_status_change();

-- Job application notification
CREATE OR REPLACE FUNCTION notify_new_job_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  artist_id uuid;
  engineer_name text;
BEGIN
  SELECT jp.artist_id, p.full_name INTO artist_id, engineer_name
  FROM job_postings jp
  LEFT JOIN profiles p ON p.id = NEW.engineer_id
  WHERE jp.id = NEW.job_id;
  
  PERFORM create_notification(
    artist_id,
    'job_application',
    'New Job Application',
    COALESCE(engineer_name, 'An engineer') || ' applied to your job posting',
    '/artist-crm?tab=opportunities',
    NEW.id,
    'job_application',
    jsonb_build_object('job_id', NEW.job_id, 'engineer_id', NEW.engineer_id)
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_job_application ON job_applications;
CREATE TRIGGER trigger_notify_new_job_application
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_job_application();
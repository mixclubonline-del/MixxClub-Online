-- Create session invitations table
CREATE TABLE IF NOT EXISTS public.session_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(session_id, engineer_id)
);

-- Enable RLS
ALTER TABLE public.session_invitations ENABLE ROW LEVEL SECURITY;

-- Artists can create invitations and view their own
CREATE POLICY "Artists can create invitations"
  ON public.session_invitations
  FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can view their sent invitations"
  ON public.session_invitations
  FOR SELECT
  USING (auth.uid() = artist_id);

-- Engineers can view invitations sent to them
CREATE POLICY "Engineers can view their invitations"
  ON public.session_invitations
  FOR SELECT
  USING (auth.uid() = engineer_id);

-- Engineers can update invitation status
CREATE POLICY "Engineers can respond to invitations"
  ON public.session_invitations
  FOR UPDATE
  USING (auth.uid() = engineer_id)
  WITH CHECK (auth.uid() = engineer_id);

-- Create index for faster queries
CREATE INDEX idx_session_invitations_engineer ON public.session_invitations(engineer_id, status);
CREATE INDEX idx_session_invitations_artist ON public.session_invitations(artist_id);
CREATE INDEX idx_session_invitations_session ON public.session_invitations(session_id);

-- Add trigger to update updated_at
CREATE TRIGGER update_session_invitations_updated_at
  BEFORE UPDATE ON public.session_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notify engineer when invitation is received
CREATE OR REPLACE FUNCTION notify_session_invitation()
RETURNS TRIGGER AS $$
DECLARE
  artist_name TEXT;
  session_name TEXT;
BEGIN
  SELECT p.full_name INTO artist_name
  FROM profiles p
  WHERE p.id = NEW.artist_id;
  
  SELECT cs.session_name INTO session_name
  FROM collaboration_sessions cs
  WHERE cs.id = NEW.session_id;
  
  PERFORM create_notification(
    NEW.engineer_id,
    'session_invitation',
    'Session Invitation',
    COALESCE(artist_name, 'An artist') || ' invited you to collaborate on "' || COALESCE(session_name, 'a session') || '"',
    '/engineer-crm?tab=sessions',
    NEW.id,
    'invitation',
    jsonb_build_object('session_id', NEW.session_id, 'artist_id', NEW.artist_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER session_invitation_created
  AFTER INSERT ON public.session_invitations
  FOR EACH ROW
  EXECUTE FUNCTION notify_session_invitation();

-- Notify artist when engineer responds
CREATE OR REPLACE FUNCTION notify_invitation_response()
RETURNS TRIGGER AS $$
DECLARE
  engineer_name TEXT;
  session_name TEXT;
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('accepted', 'declined') THEN
    SELECT p.full_name INTO engineer_name
    FROM profiles p
    WHERE p.id = NEW.engineer_id;
    
    SELECT cs.session_name INTO session_name
    FROM collaboration_sessions cs
    WHERE cs.id = NEW.session_id;
    
    PERFORM create_notification(
      NEW.artist_id,
      'invitation_response',
      'Invitation ' || CASE WHEN NEW.status = 'accepted' THEN 'Accepted' ELSE 'Declined' END,
      COALESCE(engineer_name, 'An engineer') || ' ' || NEW.status || ' your invitation to "' || COALESCE(session_name, 'session') || '"',
      '/artist-crm?tab=sessions',
      NEW.id,
      'invitation_response',
      jsonb_build_object('session_id', NEW.session_id, 'engineer_id', NEW.engineer_id, 'status', NEW.status)
    );
    
    -- If accepted, add engineer to session participants
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.session_participants (session_id, user_id, role, is_active)
      VALUES (NEW.session_id, NEW.engineer_id, 'collaborator', true)
      ON CONFLICT (session_id, user_id) DO UPDATE
      SET is_active = true, joined_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER invitation_response_trigger
  AFTER UPDATE ON public.session_invitations
  FOR EACH ROW
  EXECUTE FUNCTION notify_invitation_response();
import { useParams, useNavigate } from 'react-router-dom';
import CollaborationWorkspace from '@/components/collaboration/CollaborationWorkspace';

const SessionWorkspace = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const handleLeaveSession = () => {
    navigate('/artist-studio');
  };

  if (!sessionId) {
    navigate('/artist-studio');
    return null;
  }

  return (
    <CollaborationWorkspace 
      sessionId={sessionId} 
      onLeaveSession={handleLeaveSession}
    />
  );
};

export default SessionWorkspace;

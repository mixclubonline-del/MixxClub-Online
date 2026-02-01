import { useParams } from 'react-router-dom';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import CollaborationWorkspace from '@/components/collaboration/CollaborationWorkspace';

const SessionWorkspace = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { navigateTo } = useFlowNavigation();

  const handleLeaveSession = () => {
    navigateTo('/artist-studio');
  };

  if (!sessionId) {
    navigateTo('/artist-studio');
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

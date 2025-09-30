import { useEffect, useState } from 'react';

interface CollaborationData {
  activeUsers: number;
  onlineEngineers: number;
  activeSessions: number;
  isLive: boolean;
  recentActivity: string[];
}

export const useCollaborationStatus = () => {
  const [collaborationData, setCollaborationData] = useState<CollaborationData>({
    activeUsers: 0,
    onlineEngineers: 0,
    activeSessions: 0,
    isLive: false,
    recentActivity: []
  });

  useEffect(() => {
    // Simulate real-time collaboration data
    const interval = setInterval(() => {
      setCollaborationData({
        activeUsers: Math.floor(Math.random() * 50) + 100,
        onlineEngineers: Math.floor(Math.random() * 20) + 30,
        activeSessions: Math.floor(Math.random() * 15) + 5,
        isLive: Math.random() > 0.2,
        recentActivity: [
          'New mix uploaded',
          'Engineer joined session',
          'Beat matched to 120 BPM',
          'Vocals enhanced with AI'
        ]
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return collaborationData;
};
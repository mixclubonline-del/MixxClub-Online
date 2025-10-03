import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLiveActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Generate initial mock activities
    const mockActivities = [
      {
        id: '1',
        user: 'Sarah Chen',
        avatar: null,
        type: 'upload',
        action: 'Uploaded new track for mixing',
        projectName: 'Summer Vibes EP',
        time: 'just now',
        isLive: true
      },
      {
        id: '2',
        user: 'Mike Rodriguez',
        avatar: null,
        type: 'mix',
        action: 'Completed mixing session',
        projectName: 'Urban Beats',
        time: '2 min ago',
        isLive: false
      },
      {
        id: '3',
        user: 'Alex Kim',
        avatar: null,
        type: 'collaboration',
        action: 'Started collaboration with engineer',
        projectName: 'Acoustic Dreams',
        time: '5 min ago',
        isLive: true
      },
      {
        id: '4',
        user: 'Emma Wilson',
        avatar: null,
        type: 'achievement',
        action: 'Unlocked "Speed Demon" achievement',
        projectName: null,
        time: '10 min ago',
        isLive: false
      },
      {
        id: '5',
        user: 'James Taylor',
        avatar: null,
        type: 'session',
        action: 'Joined live mixing session',
        projectName: 'Rock Anthems',
        time: '15 min ago',
        isLive: true
      }
    ];

    setActivities(mockActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now().toString(),
        user: ['Sarah Chen', 'Mike Rodriguez', 'Alex Kim', 'Emma Wilson'][Math.floor(Math.random() * 4)],
        avatar: null,
        type: ['upload', 'mix', 'collaboration', 'achievement', 'session'][Math.floor(Math.random() * 5)],
        action: 'New activity detected',
        projectName: ['Summer Vibes', 'Urban Beats', 'Rock Anthems'][Math.floor(Math.random() * 3)],
        time: 'just now',
        isLive: Math.random() > 0.5
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 15000); // New activity every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    activities,
    isLive,
    filter,
    setFilter
  };
};
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export interface LiveActivity {
  id: string;
  user: string;
  action: string;
  message?: string;
  created_at: string;
  activity_type: string;
  type: string; // Alias for activity_type for component compatibility
  time: string; // Formatted time string
}

export const useLiveActivity = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['live-activity-feed'],
    queryFn: async (): Promise<LiveActivity[]> => {
      // Fetch recent public activity
      const { data: activities, error } = await supabase
        .from('activity_feed')
        .select(`
          id,
          title,
          description,
          activity_type,
          created_at,
          user_id,
          metadata
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform to LiveActivity format
      const transformed: LiveActivity[] = (activities || []).map((activity) => {
        // Extract user name from metadata or use a default
        const metadata = activity.metadata as Record<string, unknown> | null;
        const username = metadata?.username as string || 
                         metadata?.follower_username as string ||
                         'Someone';

        const type = mapActivityType(activity.activity_type);

        return {
          id: activity.id,
          user: username,
          action: activity.title || 'did something',
          message: activity.description || undefined,
          created_at: activity.created_at,
          activity_type: activity.activity_type,
          type,
          time: formatDistanceToNow(new Date(activity.created_at), { addSuffix: false }),
        };
      });

      // If no real activities, return demo data
      if (transformed.length === 0) {
        return getDemoActivities();
      }

      return transformed;
    },
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    activities: data || getDemoActivities(),
    isLoading,
    error,
    isLive: !isLoading && !error,
  };
};

// Map activity types to display categories
function mapActivityType(activityType: string): string {
  const typeMap: Record<string, string> = {
    'signup': 'signup',
    'project': 'upload',
    'session': 'session',
    'achievement': 'achievement',
    'collab': 'collaboration',
    'upload': 'upload',
    'follow': 'collaboration',
    'review': 'achievement',
  };
  return typeMap[activityType] || 'session';
}

// Demo activities for empty state
const getDemoActivities = (): LiveActivity[] => [
  { id: '1', user: 'MixMaster', action: 'started a mixing session', message: 'started a mixing session', activity_type: 'session', type: 'session', created_at: new Date().toISOString(), time: 'now' },
  { id: '2', user: 'BeatKing', action: 'completed a project', message: 'completed a project', activity_type: 'project', type: 'upload', created_at: new Date().toISOString(), time: '2m' },
  { id: '3', user: 'VocalQueen', action: 'joined the community', message: 'joined the community', activity_type: 'signup', type: 'signup', created_at: new Date().toISOString(), time: '5m' },
  { id: '4', user: 'StudioPro', action: 'earned an achievement', message: 'earned an achievement', activity_type: 'achievement', type: 'achievement', created_at: new Date().toISOString(), time: '8m' },
  { id: '5', user: 'SoundWave', action: 'uploaded a new track', message: 'uploaded a new track', activity_type: 'upload', type: 'upload', created_at: new Date().toISOString(), time: '12m' },
];

export default useLiveActivity;

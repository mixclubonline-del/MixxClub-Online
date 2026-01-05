import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityMember {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'artist' | 'engineer';
  location: string;
  genres: string[];
}

export interface CommunityActivity {
  id: string;
  message: string;
  timestamp: string;
  type: 'connection' | 'project' | 'join';
}

// Demo community members for showcase
const DEMO_MEMBERS: CommunityMember[] = [
  { id: '1', full_name: 'Marcus Cole', avatar_url: null, role: 'artist', location: 'Brooklyn, NY', genres: ['Hip-Hop', 'R&B'] },
  { id: '2', full_name: 'Amara Okafor', avatar_url: null, role: 'engineer', location: 'Lagos, Nigeria', genres: ['Afrobeats', 'Hip-Hop'] },
  { id: '3', full_name: 'James Chen', avatar_url: null, role: 'engineer', location: 'London, UK', genres: ['Electronic', 'Pop'] },
  { id: '4', full_name: 'Sofia Rodriguez', avatar_url: null, role: 'artist', location: 'Miami, FL', genres: ['Reggaeton', 'Latin'] },
  { id: '5', full_name: 'Kai Tanaka', avatar_url: null, role: 'artist', location: 'Tokyo, Japan', genres: ['J-Pop', 'Hip-Hop'] },
  { id: '6', full_name: 'Devon Williams', avatar_url: null, role: 'engineer', location: 'Atlanta, GA', genres: ['Trap', 'Hip-Hop'] },
  { id: '7', full_name: 'Zara Ahmed', avatar_url: null, role: 'artist', location: 'Toronto, CA', genres: ['R&B', 'Soul'] },
  { id: '8', full_name: 'Lucas Silva', avatar_url: null, role: 'engineer', location: 'São Paulo, Brazil', genres: ['Funk', 'Electronic'] },
];

const DEMO_ACTIVITIES: CommunityActivity[] = [
  { id: 'a1', message: 'Marcus just connected with Sarah in Atlanta', timestamp: '2 min ago', type: 'connection' },
  { id: 'a2', message: 'Devon dropped new heat 🔥', timestamp: '5 min ago', type: 'project' },
  { id: 'a3', message: '3 engineers online in Hip-Hop', timestamp: 'now', type: 'join' },
  { id: 'a4', message: 'Amara finished mastering for Zara', timestamp: '12 min ago', type: 'project' },
  { id: 'a5', message: 'New artist joined from London', timestamp: '18 min ago', type: 'join' },
];

export const useCommunityShowcase = (count: number = 6) => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCommunity = async () => {
      setIsLoading(true);
      
      try {
        // Try to fetch real profiles - using only columns that exist
        const { data: profiles, error, count: profileCount } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role', { count: 'exact' })
          .not('full_name', 'is', null)
          .limit(count);

        if (!error && profiles && profiles.length > 0) {
          const mappedMembers = profiles.map((p, index) => ({
            id: p.id,
            full_name: p.full_name || 'Anonymous',
            avatar_url: p.avatar_url,
            role: (p.role as 'artist' | 'engineer') || 'artist',
            location: DEMO_MEMBERS[index % DEMO_MEMBERS.length]?.location || 'Unknown',
            genres: DEMO_MEMBERS[index % DEMO_MEMBERS.length]?.genres || [],
          }));
          setMembers(mappedMembers);
          setTotalCount(profileCount || mappedMembers.length);
        } else {
          // Fallback to demo data
          const shuffled = [...DEMO_MEMBERS].sort(() => Math.random() - 0.5);
          setMembers(shuffled.slice(0, count));
          setTotalCount(10000); // Demo count
        }

        // Try to fetch real activity
        const { data: activityData, error: activityError } = await supabase
          .from('activity_feed')
          .select('id, title, created_at, activity_type')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!activityError && activityData && activityData.length > 0) {
          const mappedActivities = activityData.map(a => ({
            id: a.id,
            message: a.title,
            timestamp: formatTimeAgo(new Date(a.created_at)),
            type: mapActivityType(a.activity_type),
          }));
          setActivities(mappedActivities);
        } else {
          setActivities(DEMO_ACTIVITIES);
        }
      } catch (err) {
        console.error('Error fetching community:', err);
        // Fallback to demo data
        const shuffled = [...DEMO_MEMBERS].sort(() => Math.random() - 0.5);
        setMembers(shuffled.slice(0, count));
        setActivities(DEMO_ACTIVITIES);
        setTotalCount(10000);
      }
      
      setIsLoading(false);
    };

    fetchCommunity();
  }, [count]);

  return { members, activities, isLoading, totalCount };
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function mapActivityType(type: string): 'connection' | 'project' | 'join' {
  if (type.includes('connect') || type.includes('follow')) return 'connection';
  if (type.includes('project') || type.includes('track')) return 'project';
  return 'join';
}

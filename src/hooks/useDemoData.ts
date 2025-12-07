import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DemoEngineer {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  role: string;
  specialties: string[];
  hourly_rate: number;
  years_experience: number;
  genres: string[];
  rating: number;
  completed_projects: number;
  availability_status: string;
  points: number;
  level: number;
}

interface DemoSession {
  id: string;
  title: string;
  description: string;
  status: string;
  session_type: string;
  visibility: string;
  audio_quality: string;
  budget_range: string;
  genre: string;
  created_at: string;
  host: {
    name: string;
    avatar: string;
  };
}

interface DemoActivity {
  type: string;
  message: string;
  time: string;
  icon: string;
}

interface PlatformStats {
  totalEngineers: number;
  activeSession: number;
  projectsCompleted: number;
  totalEarnings: number;
}

interface DemoData {
  engineers: DemoEngineer[];
  sessions: DemoSession[];
  activity: DemoActivity[];
  stats: PlatformStats;
}

export const useDemoData = (type: 'all' | 'engineers' | 'sessions' | 'activity' | 'stats' = 'all') => {
  const [data, setData] = useState<Partial<DemoData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        setIsLoading(true);
        const { data: responseData, error: fetchError } = await supabase.functions.invoke('get-demo-data', {
          body: { type }
        });

        if (fetchError) throw fetchError;
        setData(responseData);
      } catch (err) {
        console.error('Error fetching demo data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch demo data');
        
        // Fallback to static data if edge function fails
        setData({
          engineers: [],
          sessions: [],
          activity: [],
          stats: {
            totalEngineers: 247,
            activeSession: 18,
            projectsCompleted: 3847,
            totalEarnings: 892450
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemoData();
  }, [type]);

  return { data, isLoading, error };
};

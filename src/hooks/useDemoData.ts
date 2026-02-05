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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: responseData, error: fetchError } = await supabase.functions.invoke('get-demo-data', {
          body: { type }
        });

        if (fetchError) throw fetchError;
        
        // Check if we got valid data
        if (responseData && (responseData.engineers || responseData.sessions || responseData.activity || responseData.stats)) {
          setData(responseData);
          setRetryCount(0);
        } else {
          throw new Error('Empty response from get-demo-data');
        }
      } catch (err) {
        console.error('Error fetching demo data:', err);
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying demo data fetch (${retryCount + 1}/${MAX_RETRIES})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(fetchDemoData, 1000 * (retryCount + 1));
          return;
        }
        
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

  const refetch = () => {
    setRetryCount(0);
    setIsLoading(true);
  };

  return { data, isLoading, error, refetch };
};

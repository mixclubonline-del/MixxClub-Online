import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAIDashboardInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const generateInsights = async () => {
      try {
        // Fetch user's projects
        const { data: projects } = await supabase
          .from('projects')
          .select('*, audio_files(count)')
          .or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(10);

        const newInsights = [];

        // Check for urgent projects
        const urgentProjects = projects?.filter(p => {
          if (!p.deadline) return false;
          const deadline = new Date(p.deadline);
          const now = new Date();
          const daysUntil = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 2 && p.status !== 'completed';
        });

        if (urgentProjects && urgentProjects.length > 0) {
          newInsights.push({
            type: 'warning',
            title: `${urgentProjects.length} project${urgentProjects.length > 1 ? 's' : ''} need attention`,
            message: 'Approaching deadlines - prioritize these projects',
            action: {
              label: 'View Projects',
              link: '/artist-crm?tab=active-work'
            }
          });
        }

        // Check for high completion rate
        const completedCount = projects?.filter(p => p.status === 'completed').length || 0;
        const totalCount = projects?.length || 1;
        const completionRate = (completedCount / totalCount) * 100;

        if (completionRate > 70) {
          newInsights.push({
            type: 'success',
            title: 'Excellent progress!',
            message: `${completionRate.toFixed(0)}% project completion rate`,
            action: null
          });
        }

        // Check for idle projects
        const idleProjects = projects?.filter(p => {
          if (p.status === 'completed') return false;
          const lastUpdate = new Date(p.updated_at);
          const now = new Date();
          const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceUpdate > 7;
        });

        if (idleProjects && idleProjects.length > 0) {
          newInsights.push({
            type: 'improvement',
            title: 'Projects waiting for updates',
            message: `${idleProjects.length} project${idleProjects.length > 1 ? 's haven\'t' : ' hasn\'t'} been updated in a week`,
            action: {
              label: 'Review Projects',
              link: '/artist-crm?tab=active-work'
            }
          });
        }

        // Default insight if no others
        if (newInsights.length === 0) {
          newInsights.push({
            type: 'success',
            title: 'All systems operational',
            message: 'Keep up the great work!',
            action: null
          });
        }

        setInsights(newInsights);
      } catch (error) {
        console.error('Error generating insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();

    // Refresh insights every 5 minutes
    const interval = setInterval(generateInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    insights,
    isLoading
  };
};
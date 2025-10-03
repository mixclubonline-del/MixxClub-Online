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
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-project-insights');
        
        if (error) throw error;
        
        setInsights(data?.insights || []);
      } catch (error) {
        console.error('Error generating insights:', error);
        // Fallback to basic insights
        setInsights([{
          type: 'info',
          title: 'Welcome!',
          message: 'Your AI insights will appear here.',
          action: { link: '/artist-crm', label: 'Get Started' }
        }]);
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
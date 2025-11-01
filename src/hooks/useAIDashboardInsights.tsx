import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { stateManager } from '@/utils/stateManager';

const INSIGHTS_STATE_KEY = 'ai_dashboard_insights';
const MAX_INSIGHTS_AGE = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

export const useAIDashboardInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any[]>(() => {
    // Load cached insights on init
    return stateManager.loadState<any[]>(INSIGHTS_STATE_KEY, MAX_INSIGHTS_AGE) || [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const generateInsights = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-project-insights');
        
        if (error) throw error;
        
        const newInsights = data?.insights || [];
        setInsights(newInsights);
        
        // Persist insights
        stateManager.saveState(INSIGHTS_STATE_KEY, newInsights, 500);
        
        // Reset retry count on success
        retryCountRef.current = 0;
      } catch (error) {
        console.error('Error generating insights:', error);
        
        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          console.log(`Retrying insights generation (${retryCountRef.current}/${MAX_RETRIES})`);
          setTimeout(generateInsights, RETRY_DELAY * retryCountRef.current);
          return;
        }
        
        // Use cached insights if available
        const cachedInsights = stateManager.loadState<any[]>(INSIGHTS_STATE_KEY);
        if (cachedInsights && cachedInsights.length > 0) {
          setInsights(cachedInsights);
        } else {
          // Fallback to basic insights
          setInsights([{
            type: 'info',
            title: 'Welcome!',
            message: 'Your AI insights will appear here.',
            action: { link: '/artist-crm', label: 'Get Started' }
          }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Load immediately
    generateInsights();
    
    // Refresh insights every 5 minutes
    intervalRef.current = setInterval(generateInsights, 5 * 60 * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);

  return {
    insights,
    isLoading
  };
};
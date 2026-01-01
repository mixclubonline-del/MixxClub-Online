import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { JOURNEYS, startJourney, completeJourneyStep } from '@/lib/journey-events';

export interface UserJourney {
  id: string;
  user_id: string;
  journey_type: string;
  current_step: string;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const useUserJourney = (journeyType?: string) => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [currentJourney, setCurrentJourney] = useState<UserJourney | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJourneys = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', user.id);

      if (journeyType) {
        query = query.eq('journey_type', journeyType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedData = (data || []) as unknown as UserJourney[];
      setJourneys(typedData);
      
      if (journeyType && typedData.length > 0) {
        setCurrentJourney(typedData[0]);
      }
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, journeyType]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  const getJourneySteps = useCallback((journey: UserJourney): JourneyStep[] => {
    const journeyDefs = Object.values(JOURNEYS);
    const definition = journeyDefs.find(j => j.id === journey.journey_type);
    if (!definition) return [];

    const currentStepIndex = definition.steps.findIndex(s => s.id === journey.current_step);
    
    return definition.steps.map((step, index) => ({
      id: step.id,
      title: step.name,
      description: `Step ${index + 1} of ${definition.steps.length}`,
      icon: 'star',
      isCompleted: index < currentStepIndex || journey.completed_at !== null,
      isCurrent: index === currentStepIndex && journey.completed_at === null,
    }));
  }, []);

  const getProgress = useCallback((journey: UserJourney): number => {
    const journeyDefs = Object.values(JOURNEYS);
    const definition = journeyDefs.find(j => j.id === journey.journey_type);
    if (!definition) return 0;

    if (journey.completed_at) return 100;

    const currentStepIndex = definition.steps.findIndex(s => s.id === journey.current_step);
    return Math.round((currentStepIndex / definition.steps.length) * 100);
  }, []);

  const startUserJourney = useCallback(async (journeyId: string) => {
    if (!user?.id) return null;

    const journeyDef = Object.values(JOURNEYS).find(j => j.id === journeyId);
    const firstStep = journeyDef?.steps[0]?.id || 'welcome';

    try {
      await startJourney(user.id, journeyId, firstStep);
      await fetchJourneys();
      return true;
    } catch (error) {
      console.error('Error starting journey:', error);
      return false;
    }
  }, [user?.id, fetchJourneys]);

  const completeStep = useCallback(async (journeyType: string, stepId: string, nextStepId?: string) => {
    if (!user?.id) return false;

    try {
      await completeJourneyStep(user.id, journeyType, stepId, nextStepId ? { nextStep: nextStepId } : undefined);
      await fetchJourneys();
      return true;
    } catch (error) {
      console.error('Error completing step:', error);
      return false;
    }
  }, [user?.id, fetchJourneys]);

  return {
    journeys,
    currentJourney,
    loading,
    getJourneySteps,
    getProgress,
    startUserJourney,
    completeStep,
    refetch: fetchJourneys,
  };
};

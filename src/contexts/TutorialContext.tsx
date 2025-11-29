import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TutorialStep {
  id: string;
  tutorial_id: string;
  step_order: number;
  title: string;
  description: string;
  target_element: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action_type: 'next' | 'click' | 'input' | 'navigate';
  action_target: string | null;
  media_url: string | null;
}

interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  target_roles: string[];
  estimated_minutes: number;
  is_active: boolean;
  steps?: TutorialStep[];
}

interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  current_step: number;
  is_completed: boolean;
  completed_at: string | null;
  started_at: string;
}

interface TutorialContextType {
  activeTutorial: Tutorial | null;
  currentStep: number;
  totalSteps: number;
  isActive: boolean;
  progress: TutorialProgress | null;
  startTutorial: (tutorialSlug: string) => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  restartTutorial: () => void;
  getTutorialsByCategory: (category: string) => Tutorial[];
  allTutorials: Tutorial[];
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState<TutorialProgress | null>(null);
  const [allTutorials, setAllTutorials] = useState<Tutorial[]>([]);

  // Load all tutorials
  useEffect(() => {
    const loadTutorials = async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select(`
          *,
          steps:tutorial_steps(*)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading tutorials:', error);
        return;
      }

      setAllTutorials(data as Tutorial[]);
    };

    loadTutorials();
  }, []);

  const startTutorial = async (tutorialSlug: string) => {
    if (!user) {
      toast.error('Please sign in to start tutorials');
      return;
    }

    // Find tutorial
    const tutorial = allTutorials.find(t => t.slug === tutorialSlug);
    if (!tutorial) {
      toast.error('Tutorial not found');
      return;
    }

    // Load or create progress
    const { data: existingProgress } = await supabase
      .from('user_tutorial_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('tutorial_id', tutorial.id)
      .single();

    if (existingProgress) {
      setProgress(existingProgress);
      setCurrentStep(existingProgress.current_step);
    } else {
      const { data: newProgress, error } = await supabase
        .from('user_tutorial_progress')
        .insert({
          user_id: user.id,
          tutorial_id: tutorial.id,
          current_step: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating progress:', error);
        toast.error('Failed to start tutorial');
        return;
      }

      setProgress(newProgress);
      setCurrentStep(0);
    }

    setActiveTutorial(tutorial);
    toast.success(`Starting: ${tutorial.title}`);
  };

  const nextStep = async () => {
    if (!activeTutorial || !progress || !user) return;

    const steps = activeTutorial.steps || [];
    const nextStepIndex = currentStep + 1;

    if (nextStepIndex >= steps.length) {
      completeTutorial();
      return;
    }

    setCurrentStep(nextStepIndex);

    await supabase
      .from('user_tutorial_progress')
      .update({ current_step: nextStepIndex })
      .eq('id', progress.id);
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = async () => {
    if (!progress) return;

    await supabase
      .from('user_tutorial_progress')
      .update({ 
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', progress.id);

    setActiveTutorial(null);
    setCurrentStep(0);
    setProgress(null);
    toast.info('Tutorial skipped');
  };

  const completeTutorial = async () => {
    if (!progress || !activeTutorial) return;

    await supabase
      .from('user_tutorial_progress')
      .update({ 
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', progress.id);

    toast.success(`Tutorial completed: ${activeTutorial.title}!`, {
      description: 'You earned 50 XP!'
    });

    setActiveTutorial(null);
    setCurrentStep(0);
    setProgress(null);
  };

  const restartTutorial = async () => {
    if (!activeTutorial || !progress) return;

    setCurrentStep(0);

    await supabase
      .from('user_tutorial_progress')
      .update({ 
        current_step: 0,
        is_completed: false,
        completed_at: null
      })
      .eq('id', progress.id);

    toast.success('Tutorial restarted');
  };

  const getTutorialsByCategory = (category: string) => {
    return allTutorials.filter(t => t.category === category);
  };

  return (
    <TutorialContext.Provider
      value={{
        activeTutorial,
        currentStep,
        totalSteps: activeTutorial?.steps?.length || 0,
        isActive: !!activeTutorial,
        progress,
        startTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        completeTutorial,
        restartTutorial,
        getTutorialsByCategory,
        allTutorials,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

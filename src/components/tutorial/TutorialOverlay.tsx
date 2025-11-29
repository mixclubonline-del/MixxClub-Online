import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useTutorial } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TutorialSpotlight } from './TutorialSpotlight';

export const TutorialOverlay = () => {
  const {
    activeTutorial,
    currentStep,
    totalSteps,
    isActive,
    nextStep,
    previousStep,
    skipTutorial,
  } = useTutorial();

  if (!isActive || !activeTutorial) return null;

  const steps = activeTutorial.steps || [];
  const step = steps[currentStep];

  if (!step) return null;

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Spotlight effect */}
        <TutorialSpotlight targetElement={step.target_element} />

        {/* Tutorial card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4"
        >
          <Card className="p-6 shadow-xl border-primary/20">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>{activeTutorial.title}</span>
                  <span>•</span>
                  <span>Step {currentStep + 1} of {totalSteps}</span>
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipTutorial}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <Progress value={progressPercent} className="mb-4 h-1" />

            {/* Content */}
            <div className="mb-6">
              <p className="text-muted-foreground">{step.description}</p>
              {step.media_url && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <img 
                    src={step.media_url} 
                    alt={step.title}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTutorial}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip Tutorial
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={nextStep}
                >
                  {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

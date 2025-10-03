import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveProductTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export const InteractiveProductTour = ({ 
  tourId, 
  steps, 
  onComplete,
  autoStart = false 
}: InteractiveProductTourProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`tour_completed_${tourId}`);
    if (completed) {
      setHasCompleted(true);
    } else if (autoStart) {
      setIsActive(true);
    }
  }, [tourId, autoStart]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour_completed_${tourId}`, 'true');
    setIsActive(false);
    setHasCompleted(true);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsActive(false);
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsActive(true);
    setHasCompleted(false);
    localStorage.removeItem(`tour_completed_${tourId}`);
  };

  if (!isActive && !hasCompleted) {
    return (
      <Button
        onClick={() => setIsActive(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Start Tour
      </Button>
    );
  }

  if (hasCompleted && !isActive) {
    return (
      <Button
        onClick={restartTour}
        variant="ghost"
        size="sm"
        className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100"
      >
        Replay Tour
      </Button>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            <Card className="border-2 border-primary shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {currentStep + 1}
                      </div>
                      <h3 className="text-lg font-bold">{currentStepData.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentStepData.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-xs text-muted-foreground">
                    {currentStep + 1} of {steps.length}
                  </span>

                  <Button
                    onClick={handleNext}
                    size="sm"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  variant="link"
                  onClick={handleSkip}
                  className="w-full text-xs"
                >
                  Skip tour
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

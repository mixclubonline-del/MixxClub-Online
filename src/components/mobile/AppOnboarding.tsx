import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Zap, Cloud, Bell, Check } from 'lucide-react';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Zap className="w-12 h-12 text-primary" />,
    title: 'Lightning Fast',
    description: 'Experience blazing fast performance optimized for mobile'
  },
  {
    icon: <Cloud className="w-12 h-12 text-primary" />,
    title: 'Works Offline',
    description: 'Access your content even without an internet connection'
  },
  {
    icon: <Bell className="w-12 h-12 text-primary" />,
    title: 'Stay Updated',
    description: 'Get notifications about important updates and activities'
  }
];

export const AppOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShow(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                {steps[currentStep].icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-3">
                {steps[currentStep].title}
              </h2>
              
              <p className="text-muted-foreground mb-8">
                {steps[currentStep].description}
              </p>

              <div className="flex gap-2 justify-center mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-primary' 
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleComplete}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  {currentStep === steps.length - 1 ? (
                    <>
                      Get Started <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

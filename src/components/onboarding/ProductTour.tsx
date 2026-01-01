import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Users, 
  Headphones, 
  BarChart3, 
  MessageSquare,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for highlighting
}

interface ProductTourProps {
  userRole: 'artist' | 'engineer';
  onComplete: () => void;
  onSkip: () => void;
}

const artistSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Artist CRM",
    description: "Your command center for managing tracks, collaborations, and your music career. Let's take a quick tour!",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "upload",
    title: "Upload Your Tracks",
    description: "Drop your stems or mixdowns here. Our AI will analyze your audio and prepare it for the best possible mix.",
    icon: <Upload className="w-6 h-6" />,
    target: "[data-tour='upload']",
  },
  {
    id: "find-engineers",
    title: "Find Perfect Engineers",
    description: "Browse verified engineers matched to your genre. See their portfolios, ratings, and availability in real-time.",
    icon: <Users className="w-6 h-6" />,
    target: "[data-tour='engineers']",
  },
  {
    id: "collaborate",
    title: "Real-Time Collaboration",
    description: "Work live with your engineer. Share audio, give feedback, and watch your mix come to life.",
    icon: <Headphones className="w-6 h-6" />,
    target: "[data-tour='sessions']",
  },
  {
    id: "analytics",
    title: "Track Your Progress",
    description: "Monitor your releases, earnings, and growth with detailed analytics and insights.",
    icon: <BarChart3 className="w-6 h-6" />,
    target: "[data-tour='analytics']",
  },
];

const engineerSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Engineer CRM",
    description: "Your professional hub for managing clients, projects, and growing your engineering business.",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "jobs",
    title: "Browse Available Jobs",
    description: "Find projects that match your skills and genre expertise. Apply with one click.",
    icon: <MessageSquare className="w-6 h-6" />,
    target: "[data-tour='jobs']",
  },
  {
    id: "clients",
    title: "Manage Your Clients",
    description: "Keep track of all your artists, their projects, and communication history in one place.",
    icon: <Users className="w-6 h-6" />,
    target: "[data-tour='clients']",
  },
  {
    id: "workspace",
    title: "Professional Workspace",
    description: "Access our integrated tools for mixing, mastering, and real-time collaboration.",
    icon: <Headphones className="w-6 h-6" />,
    target: "[data-tour='workspace']",
  },
  {
    id: "earnings",
    title: "Track Your Earnings",
    description: "View your revenue, pending payouts, and performance bonuses. Get paid instantly.",
    icon: <BarChart3 className="w-6 h-6" />,
    target: "[data-tour='earnings']",
  },
];

export const ProductTour = ({ userRole, onComplete, onSkip }: ProductTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = userRole === 'artist' ? artistSteps : engineerSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;

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
    setIsVisible(false);
    localStorage.setItem(`tour_completed_${userRole}`, 'true');
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem(`tour_skipped_${userRole}`, 'true');
    onSkip();
  };

  // Highlight target element if specified
  useEffect(() => {
    const step = steps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        element.classList.add('tour-highlight');
        return () => element.classList.remove('tour-highlight');
      }
    }
  }, [currentStep, steps]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Card className="w-full max-w-lg mx-4 border-2 border-primary/20 shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleSkip}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {currentStepData.icon}
                </div>
                <Badge variant="secondary">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>

              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <CardDescription className="text-base">
                {currentStepData.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress bar */}
              <Progress value={progress} className="h-2" />

              {/* Step indicators */}
              <div className="flex justify-center gap-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "w-6 bg-primary"
                        : index < currentStep
                        ? "bg-primary/60"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  className="gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Tour
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip option */}
              <div className="text-center">
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip tour, I'll explore on my own
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to check if user should see the tour
export const useProductTour = (userRole: 'artist' | 'engineer') => {
  const [shouldShowTour, setShouldShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`tour_completed_${userRole}`);
    const skipped = localStorage.getItem(`tour_skipped_${userRole}`);
    
    if (!completed && !skipped) {
      // Delay showing tour to let the page load
      const timer = setTimeout(() => setShouldShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [userRole]);

  const resetTour = () => {
    localStorage.removeItem(`tour_completed_${userRole}`);
    localStorage.removeItem(`tour_skipped_${userRole}`);
    setShouldShowTour(true);
  };

  return { shouldShowTour, setShouldShowTour, resetTour };
};

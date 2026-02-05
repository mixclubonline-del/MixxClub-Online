import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OnboardingPanelProps {
  children: ReactNode;
  stepKey: string | number;
  onBack?: () => void;
  onNext: () => void;
  canProceed: boolean;
  isSubmitting?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  variant?: 'artist' | 'engineer';
  destinationPath?: string;
}

export function OnboardingPanel({
  children,
  stepKey,
  onBack,
  onNext,
  canProceed,
  isSubmitting = false,
  isFirstStep = false,
  isLastStep = false,
  variant = 'artist',
  destinationPath = '/dashboard',
}: OnboardingPanelProps) {
  const navigate = useNavigate();
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const handleSkipClick = () => {
    setShowSkipConfirm(true);
  };

  const handleConfirmSkip = () => {
    toast.info("You can complete your profile anytime from Settings", {
      duration: 5000,
      action: {
        label: "Go to Settings",
        onClick: () => navigate('/settings')
      }
    });
    navigate(destinationPath);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 max-md:py-4 max-md:px-3">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg max-md:max-w-full"
      >
        {/* Glass panel */}
        <div 
          className="rounded-2xl p-6 md:p-8 max-md:p-4 backdrop-blur-xl border border-white/10"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--background) / 0.8) 0%, hsl(var(--background) / 0.6) 100%)',
            boxShadow: `
              0 25px 50px -12px hsl(var(--${variant === 'artist' ? 'primary' : 'accent'}) / 0.15),
              inset 0 1px 0 hsl(var(--foreground) / 0.05)
            `,
          }}
        >
          {/* Skip button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipClick}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              Skip for now
              <SkipForward className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px] max-md:min-h-[250px]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 gap-4 max-md:mt-6">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isFirstStep}
              className="gap-2 border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="max-md:hidden">Back</span>
            </Button>
            
            <Button
              onClick={onNext}
              disabled={!canProceed || isSubmitting}
              className={`gap-2 ${
                variant === 'artist' 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-accent hover:bg-accent/90'
              }`}
            >
              {isLastStep ? (
                isSubmitting ? 'Entering...' : 'Enter MIXXCLUB'
              ) : (
                'Continue'
              )}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip Profile Setup?</AlertDialogTitle>
            <AlertDialogDescription>
              You can complete your profile later, but some features like matching with {variant === 'artist' ? 'engineers' : 'artists'} will be limited until you do.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Setup</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSkip}>
              Skip for Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

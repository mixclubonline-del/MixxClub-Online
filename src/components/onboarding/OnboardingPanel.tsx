import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

interface OnboardingPanelProps {
  children: ReactNode;
  stepKey: string | number;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canProceed: boolean;
  isSubmitting?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  variant?: 'artist' | 'engineer';
}

export function OnboardingPanel({
  children,
  stepKey,
  onBack,
  onNext,
  onSkip,
  canProceed,
  isSubmitting = false,
  isFirstStep = false,
  isLastStep = false,
  variant = 'artist',
}: OnboardingPanelProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Glass panel */}
        <div 
          className="rounded-2xl p-6 md:p-8 backdrop-blur-xl border border-white/10"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--background) / 0.8) 0%, hsl(var(--background) / 0.6) 100%)',
            boxShadow: `
              0 25px 50px -12px hsl(var(--${variant === 'artist' ? 'primary' : 'accent'}) / 0.15),
              inset 0 1px 0 hsl(var(--foreground) / 0.05)
            `,
          }}
        >
          {/* Skip button */}
          {onSkip && (
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground gap-1"
              >
                Skip for now
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {/* Animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isFirstStep}
              className="gap-2 border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
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
    </div>
  );
}

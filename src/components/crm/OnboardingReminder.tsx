import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingReminderProps {
  userType: 'artist' | 'engineer';
}

export function OnboardingReminder({ userType }: OnboardingReminderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return;

      // Check localStorage for dismiss
      const dismissKey = `onboarding_reminder_dismissed_${user.id}`;
      if (localStorage.getItem(dismissKey)) {
        return;
      }

      // Check if onboarding completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, username')
        .eq('id', user.id)
        .single();

      // Show reminder if profile incomplete
      if (profile && !profile.onboarding_completed && !profile.username) {
        setShowReminder(true);
      }
    };

    checkProfileCompletion();
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`onboarding_reminder_dismissed_${user.id}`, 'true');
    }
    setDismissed(true);
    setShowReminder(false);
  };

  const handleContinue = () => {
    navigate(`/onboarding/${userType}`);
  };

  if (dismissed || !showReminder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-primary rounded-lg p-4 mb-6"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">
              Complete Your Profile
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {userType === 'artist' 
                ? 'Set up your profile to get matched with the perfect engineers for your sound.'
                : 'Complete your profile to start getting matched with artists looking for your expertise.'}
            </p>
            <Button 
              onClick={handleContinue}
              size="sm"
              className="gap-2"
            >
              Continue Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
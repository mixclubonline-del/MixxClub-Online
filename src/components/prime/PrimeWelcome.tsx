import { motion } from 'framer-motion';
import { PrimeAvatar } from './PrimeAvatar';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PrimeWelcomeProps {
  userName?: string;
  userRole?: 'artist' | 'engineer';
  onGetStarted?: () => void;
  onDismiss?: () => void;
}

export const PrimeWelcome = ({
  userName,
  userRole = 'artist',
  onGetStarted,
  onDismiss,
}: PrimeWelcomeProps) => {
  const messages = {
    artist: {
      greeting: `Hey ${userName || 'there'}! I'm Prime, your AI mixing assistant.`,
      description: "I'll help you get studio-quality mixes by analyzing your tracks and matching you with the perfect engineer. Let's make your music shine! ✨",
      cta: "Let's Start Mixing",
    },
    engineer: {
      greeting: `Welcome ${userName || 'back'}! I'm Prime, your session prep assistant.`,
      description: "I analyze every upload before you start, giving you musical DNA insights, stems detection, and mix suggestions. More time creating, less time guessing! 🎚️",
      cta: "Show Me How",
    },
  };

  const content = messages[userRole];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary-glow/10 border border-primary/20 p-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="relative">
          <div className="flex items-start gap-4">
            <PrimeAvatar size="xl" animate />
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  {content.greeting}
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {content.description}
                </p>
              </div>

              <div className="flex gap-3">
                {onGetStarted && (
                  <Button onClick={onGetStarted} size="lg" className="gap-2">
                    {content.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                {onDismiss && (
                  <Button onClick={onDismiss} variant="outline" size="lg">
                    I'll Explore
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

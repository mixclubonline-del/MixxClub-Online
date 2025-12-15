import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PulsingCTAProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: 'arrow' | 'sparkles';
}

export const PulsingCTA = ({ 
  text, 
  onClick, 
  variant = 'primary',
  icon = 'arrow'
}: PulsingCTAProps) => {
  const Icon = icon === 'sparkles' ? Sparkles : ArrowRight;

  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pulsing glow ring */}
      <motion.div
        className={`absolute inset-0 rounded-full ${
          variant === 'primary' 
            ? 'bg-primary/30' 
            : 'bg-accent/30'
        } blur-xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <Button
        onClick={onClick}
        size="lg"
        className={`relative z-10 px-8 py-6 text-lg font-bold ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
            : 'bg-background/20 border-2 border-primary/50 hover:border-primary hover:bg-primary/10'
        } transition-all duration-300`}
      >
        <span className="mr-2">{text}</span>
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Icon className="w-5 h-5" />
        </motion.span>
      </Button>
    </motion.div>
  );
};

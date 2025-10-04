import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface PrimeAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export const PrimeAvatar = ({ size = 'md', animate = true, className = '' }: PrimeAvatarProps) => {
  const Avatar = animate ? motion.div : 'div';

  return (
    <Avatar
      className={`relative ${sizeClasses[size]} ${className}`}
      {...(animate && {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3 }
      })}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent animate-gradient-flow" />
      <div className="absolute inset-0.5 rounded-full bg-background flex items-center justify-center">
        <Sparkles className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'} text-primary`} />
      </div>
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </Avatar>
  );
};

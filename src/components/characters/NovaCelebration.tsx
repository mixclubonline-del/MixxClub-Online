import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getCharacter } from '@/config/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { Sparkles, Trophy, Music, Loader2 } from 'lucide-react';

interface NovaCelebrationProps {
  type: 'achievement' | 'track-live' | 'milestone' | 'waiting';
  title?: string;
  message?: string;
  className?: string;
}

const typeConfig = {
  achievement: {
    icon: Trophy,
    defaultTitle: 'Achievement Unlocked!',
    defaultMessage: "You did it! Keep pushing.",
    iconColor: 'text-yellow-400',
  },
  'track-live': {
    icon: Music,
    defaultTitle: "You're Live!",
    defaultMessage: "Your track is out there. Get ready for those charts!",
    iconColor: 'text-green-400',
  },
  milestone: {
    icon: Sparkles,
    defaultTitle: 'Milestone Reached!',
    defaultMessage: "Look at you go. The journey continues.",
    iconColor: 'text-purple-400',
  },
  waiting: {
    icon: Loader2,
    defaultTitle: 'Good Things Coming...',
    defaultMessage: "Everybody starts somewhere.",
    iconColor: 'text-muted-foreground',
  },
};

export const NovaCelebration = ({
  type,
  title,
  message,
  className,
}: NovaCelebrationProps) => {
  const nova = getCharacter('nova');
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-10"
        style={{
          background: `radial-gradient(circle at center, ${nova.accentColor}, transparent 70%)`,
        }}
      />

      {/* Floating particles for celebration types */}
      {type !== 'waiting' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: nova.accentColor }}
              initial={{
                x: '50%',
                y: '50%',
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: `${30 + Math.random() * 40}%`,
                y: `${20 + Math.random() * 60}%`,
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}
        </div>
      )}

      {/* Nova avatar */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CharacterAvatar characterId="nova" size="xl" />
      </motion.div>

      {/* Icon badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        className={cn(
          'mt-4 p-3 rounded-full bg-background/80 backdrop-blur-sm',
          config.iconColor
        )}
      >
        <Icon
          className={cn(
            'w-8 h-8',
            type === 'waiting' && 'animate-spin'
          )}
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-xl font-bold text-foreground"
      >
        {title || config.defaultTitle}
      </motion.h3>

      {/* Nova's quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-muted-foreground max-w-sm"
      >
        <span
          className="font-semibold"
          style={{ color: nova.accentColor }}
        >
          Nova:
        </span>{' '}
        "{message || config.defaultMessage}"
      </motion.p>
    </motion.div>
  );
};

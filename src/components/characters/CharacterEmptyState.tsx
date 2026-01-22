import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CharacterAvatar } from './CharacterAvatar';
import { getCharacter, getContextQuote, type CharacterId, type EmptyStateContext } from '@/config/characters';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Plus, Search, MessageCircle, Music, Users, 
  DollarSign, Heart, Bell, Activity, Star, CreditCard,
  Folder, Handshake
} from 'lucide-react';

interface CharacterEmptyStateProps {
  type: EmptyStateContext;
  characterId?: CharacterId;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const typeConfig: Record<EmptyStateContext, {
  icon: typeof Music;
  defaultTitle: string;
}> = {
  sessions: {
    icon: Users,
    defaultTitle: 'No sessions yet',
  },
  projects: {
    icon: Folder,
    defaultTitle: 'No projects',
  },
  matches: {
    icon: Users,
    defaultTitle: 'No matches yet',
  },
  messages: {
    icon: MessageCircle,
    defaultTitle: 'No messages',
  },
  tracks: {
    icon: Music,
    defaultTitle: 'No tracks uploaded',
  },
  clients: {
    icon: Users,
    defaultTitle: 'No clients yet',
  },
  loading: {
    icon: Loader2,
    defaultTitle: 'Loading...',
  },
  search: {
    icon: Search,
    defaultTitle: 'No results found',
  },
  earnings: {
    icon: DollarSign,
    defaultTitle: 'No earnings yet',
  },
  partnerships: {
    icon: Handshake,
    defaultTitle: 'No partnerships yet',
  },
  'saved-items': {
    icon: Heart,
    defaultTitle: 'Nothing saved',
  },
  notifications: {
    icon: Bell,
    defaultTitle: 'No notifications',
  },
  activity: {
    icon: Activity,
    defaultTitle: 'No activity yet',
  },
  reviews: {
    icon: Star,
    defaultTitle: 'No reviews yet',
  },
  payments: {
    icon: CreditCard,
    defaultTitle: 'No payments yet',
  },
  generic: {
    icon: Plus,
    defaultTitle: 'Nothing here yet',
  },
};

export function CharacterEmptyState({
  type,
  characterId = 'nova',
  title,
  message,
  actionLabel,
  onAction,
  className,
}: CharacterEmptyStateProps) {
  const character = getCharacter(characterId);
  const config = typeConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  // Use context-specific quote from Nova's contextQuotes
  const displayMessage = message || getContextQuote(characterId, type);
  const isLoading = type === 'loading';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* Character Avatar with ambient pulse */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative mb-6"
      >
        {/* Ambient breathing glow */}
        <motion.div 
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: character.accentColor }}
          animate={{ 
            opacity: [0.2, 0.35, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <CharacterAvatar characterId={characterId} size="lg" showGlow />
      </motion.div>

      {/* Icon Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div 
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-muted/50 border border-border/50"
          )}
        >
          <Icon 
            className={cn(
              "w-6 h-6 text-muted-foreground",
              isLoading && "animate-spin"
            )} 
          />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {displayTitle}
      </motion.h3>

      {/* Character Quote - the soul */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground max-w-sm mb-2 italic"
      >
        "{displayMessage}"
      </motion.p>

      {/* Character Name with accent */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs font-medium mb-6"
        style={{ color: character.accentColor }}
      >
        — {character.name}
      </motion.p>

      {/* Action Button */}
      {actionLabel && onAction && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button 
            onClick={onAction} 
            variant="default" 
            size="sm"
            className="bg-gradient-to-r from-primary to-[hsl(330_80%_60%)] hover:opacity-90"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

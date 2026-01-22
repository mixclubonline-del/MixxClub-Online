import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CharacterAvatar } from './CharacterAvatar';
import { getCharacter, getRandomQuote, type CharacterId } from '@/config/characters';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, MessageCircle, Music, Users } from 'lucide-react';

type EmptyStateType = 
  | 'sessions' 
  | 'projects' 
  | 'matches' 
  | 'messages' 
  | 'tracks' 
  | 'clients'
  | 'loading'
  | 'search'
  | 'generic';

interface CharacterEmptyStateProps {
  type: EmptyStateType;
  characterId?: CharacterId;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const typeConfig: Record<EmptyStateType, {
  icon: typeof Music;
  defaultTitle: string;
  defaultMessage: string;
}> = {
  sessions: {
    icon: Users,
    defaultTitle: 'No sessions yet',
    defaultMessage: "Everybody starts somewhere. Let's get you in a room.",
  },
  projects: {
    icon: Music,
    defaultTitle: 'No projects',
    defaultMessage: "Your first project is waiting. What are you working on?",
  },
  matches: {
    icon: Users,
    defaultTitle: 'No matches yet',
    defaultMessage: "The right person is out there. Let's find them.",
  },
  messages: {
    icon: MessageCircle,
    defaultTitle: 'No messages',
    defaultMessage: "Silence before the storm. Your inbox is ready.",
  },
  tracks: {
    icon: Music,
    defaultTitle: 'No tracks uploaded',
    defaultMessage: "Upload your first track and let's get it sounding right.",
  },
  clients: {
    icon: Users,
    defaultTitle: 'No clients yet',
    defaultMessage: "Your first client is just around the corner.",
  },
  loading: {
    icon: Loader2,
    defaultTitle: 'Loading...',
    defaultMessage: "Good things coming... patience.",
  },
  search: {
    icon: Search,
    defaultTitle: 'No results found',
    defaultMessage: "Try a different search. The perfect match is out there.",
  },
  generic: {
    icon: Plus,
    defaultTitle: 'Nothing here yet',
    defaultMessage: "You're in the right room. Let's fill it up.",
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
  const displayMessage = message || config.defaultMessage;
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
      {/* Character Avatar with glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative mb-6"
      >
        {/* Ambient glow */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{ background: character.accentColor }}
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

      {/* Character Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground max-w-sm mb-2"
      >
        "{displayMessage}"
      </motion.p>

      {/* Character Name */}
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
          <Button onClick={onAction} variant="default" size="sm">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

import { cn } from '@/lib/utils';
import { getCharacter, getRandomQuote, type CharacterId } from '@/config/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { motion } from 'framer-motion';

interface CharacterQuoteProps {
  characterId: CharacterId;
  quote?: string;
  variant?: 'inline' | 'card';
  showName?: boolean;
  className?: string;
}

export const CharacterQuote = ({
  characterId,
  quote,
  variant = 'inline',
  showName = true,
  className,
}: CharacterQuoteProps) => {
  const character = getCharacter(characterId);
  const displayQuote = quote || getRandomQuote(characterId);

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('flex items-center gap-3', className)}
      >
        <CharacterAvatar characterId={characterId} size="sm" showGlow={false} />
        <div className="flex flex-col">
          {showName && (
            <span
              className="text-xs font-semibold"
              style={{ color: character.accentColor }}
            >
              {character.name}
            </span>
          )}
          <span className="text-sm text-muted-foreground italic">
            "{displayQuote}"
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative p-4 rounded-xl border bg-card/50 backdrop-blur-sm',
        className
      )}
      style={{
        borderColor: `${character.accentColor}33`,
      }}
    >
      {/* Accent gradient background */}
      <div
        className="absolute inset-0 rounded-xl opacity-5"
        style={{
          background: `linear-gradient(135deg, ${character.accentColor}, transparent)`,
        }}
      />

      <div className="relative z-10 flex items-start gap-4">
        <CharacterAvatar characterId={characterId} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="font-bold"
              style={{ color: character.accentColor }}
            >
              {character.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {character.role}
            </span>
          </div>
          <p className="text-foreground leading-relaxed">
            "{displayQuote}"
          </p>
        </div>
      </div>
    </motion.div>
  );
};

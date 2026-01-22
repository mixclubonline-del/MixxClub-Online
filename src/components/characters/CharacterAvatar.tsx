import { cn } from '@/lib/utils';
import { getCharacter, type CharacterId } from '@/config/characters';

interface CharacterAvatarProps {
  characterId: CharacterId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export const CharacterAvatar = ({
  characterId,
  size = 'md',
  showGlow = true,
  className,
}: CharacterAvatarProps) => {
  const character = getCharacter(characterId);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden transition-all duration-300',
        sizeClasses[size],
        showGlow && character.accentGlow,
        className
      )}
    >
      {/* Accent ring */}
      <div
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background: `linear-gradient(135deg, ${character.accentColor}, transparent)`,
        }}
      />

      {/* Avatar image */}
      <img
        src={character.avatarPath}
        alt={character.name}
        className="w-full h-full object-cover rounded-full relative z-10"
      />

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: character.accentColor }}
      />
    </div>
  );
};

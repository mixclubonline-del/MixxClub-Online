import React, { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCharacter, ENTRY_POINT_CHARACTERS, type CharacterId } from '@/config/characters';

// Role labels for badge display
const ROLE_LABELS: Record<string, string> = {
  artist: 'Artist',
  engineer: 'Engineer',
  producer: 'Producer',
  fan: 'Fan',
  admin: 'Admin',
};

// Role-specific studio labels for mobile
const ROLE_STUDIO_LABELS: Record<string, string> = {
  artist: 'Artist Studio',
  engineer: 'Pro Studio',
  producer: 'Beat Lab',
  fan: 'Fan Zone',
  admin: 'Command Center',
};

// Role badge accent classes
const ROLE_BADGE_ACCENTS: Record<string, string> = {
  artist: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
  engineer: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
  producer: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  fan: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
  admin: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
};

interface CRMStatusBarProps {
  userType: 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';
  profile: any;
  stats: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
    color: string;
  }>;
  onBackToGrid?: () => void;
}

export const CRMStatusBar: React.FC<CRMStatusBarProps> = ({
  userType,
  profile,
  stats,
  onBackToGrid,
}) => {
  const isMobile = useIsMobile();
  const badgeAccent = ROLE_BADGE_ACCENTS[userType] || ROLE_BADGE_ACCENTS.artist;

  // Get role-specific AI guide character
  const guide = useMemo(() => {
    const characterId = ENTRY_POINT_CHARACTERS[userType as keyof typeof ENTRY_POINT_CHARACTERS] || 'jax';
    return getCharacter(characterId);
  }, [userType]);

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = (profile.level - 1) * 1000;
    const progressInLevel = (profile.points || 0) - currentLevelPoints;
    return Math.min((progressInLevel / 1000) * 100, 100);
  };

  return (
    <motion.div
      className={cn(
        "mg-panel",
        isMobile ? "p-4" : "p-5"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left section: Back button + User info */}
        <div className="flex items-center gap-4">
          {onBackToGrid && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToGrid}
              className="shrink-0 hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/10 shadow-lg shadow-primary/10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-foreground">
                  {profile?.full_name || 'Welcome'}
                </h2>
                {/* AI Guide Avatar */}
                <div
                  className="w-6 h-6 rounded-full overflow-hidden border border-white/15"
                  style={{ boxShadow: `0 0 10px ${guide.accentColor}` }}
                  title={`${guide.name} is your guide`}
                >
                  <img
                    src={guide.avatarPath}
                    alt={guide.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs", badgeAccent)}
                >
                  {ROLE_LABELS[userType] || 'Creator'}
                </Badge>
              </div>

              {/* Level progress */}
              <div className="flex items-center gap-2 mt-1">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Level {profile?.level || 1}
                </span>
                <Progress value={getLevelProgress()} className="w-20 h-1.5" />
                <span className="text-xs text-muted-foreground">
                  {profile?.points || 0} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right section: Stats — Glassmorphic stat pills */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            {stats.slice(0, 4).map((stat, index) => (
              <motion.div
                key={index}
                className="mg-pill flex items-center gap-2 px-4 py-2 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={cn("p-1.5 rounded-lg", stat.color)}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile: Compact stats with guide */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full overflow-hidden border border-white/15"
              style={{ boxShadow: `0 0 8px ${guide.accentColor}` }}
            >
              <img
                src={guide.avatarPath}
                alt={guide.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-primary">
              {ROLE_STUDIO_LABELS[userType] || 'Studio'}
            </span>
          </div>
        )}
      </div>

      {/* Mobile stats row */}
      {isMobile && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="mg-pill flex items-center gap-2 px-3 py-2 rounded-lg shrink-0"
            >
              <div className={cn("p-1 rounded", stat.color)}>
                {stat.icon}
              </div>
              <div className="text-sm font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { getCharacter, ENTRY_POINT_CHARACTERS, type CharacterId } from '@/config/characters';

interface WelcomeGateProps {
  role: 'artist' | 'engineer' | 'producer' | 'fan';
  children: ReactNode;
}

const STORAGE_PREFIX = 'mixx_welcome_seen_';

const roleColors: Record<string, string> = {
  artist: 'hsl(var(--primary))',
  engineer: 'hsl(var(--accent))',
  producer: 'hsl(45 90% 50%)',
  fan: 'hsl(330 80% 60%)',
};

const roleLabels: Record<string, string> = {
  artist: 'Artist',
  engineer: 'Engineer',
  producer: 'Producer',
  fan: 'Fan',
};

export function WelcomeGate({ role, children }: WelcomeGateProps) {
  const { user, loading } = useAuth();
  const storageKey = `${STORAGE_PREFIX}${role}`;
  const alreadySeen = typeof window !== 'undefined' && localStorage.getItem(storageKey) === 'true';
  const [showWelcome, setShowWelcome] = useState(!alreadySeen);

  const characterId: CharacterId = ENTRY_POINT_CHARACTERS[role];
  const character = getCharacter(characterId);

  const handleContinue = () => {
    localStorage.setItem(storageKey, 'true');
    setShowWelcome(false);
  };

  // Branded loading state while auth resolves
  if (loading || !user) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ backgroundColor: roleColors[role] }}
          />
          <CharacterAvatar characterId={characterId} size="xl" showGlow />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your experience...</p>
      </div>
    );
  }

  // Already seen welcome → pass through to wizard
  if (!showWelcome) {
    return <>{children}</>;
  }

  // Welcome screen
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{ backgroundColor: roleColors[role] }}
      />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-md"
        >
          {/* Character avatar */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
            className="mb-6"
          >
            <CharacterAvatar characterId={characterId} size="xl" showGlow />
          </motion.div>

          {/* Welcome copy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-3 mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Welcome to MIXXCLUB
            </h1>
            <p className="text-lg text-muted-foreground">
              {character.tagline}
            </p>

            {/* Character quote */}
            <div
              className="mt-4 px-5 py-3 rounded-xl border border-white/10 backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, hsl(var(--background) / 0.8), hsl(var(--background) / 0.5))`,
              }}
            >
              <p className="text-sm text-foreground/80 italic">
                "{character.onboardingQuotes?.[0] || character.sampleQuotes[0]}"
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                — {character.name}, {character.role}
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-full space-y-3"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full h-13 text-base font-semibold gap-2"
              style={{
                backgroundColor: roleColors[role],
                color: role === 'producer' ? 'hsl(0 0% 10%)' : 'hsl(var(--primary-foreground))',
              }}
            >
              Set Up Your {roleLabels[role]} Profile
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-xs text-muted-foreground">
              Takes about 2 minutes • You'll earn XP for completing it
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

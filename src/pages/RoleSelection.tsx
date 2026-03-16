import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUnlockContribution } from '@/hooks/useUnlockContribution';
import { attributionToasts } from '@/components/unlock/UnlockAttributionToast';
import { motion } from 'framer-motion';
import { Mic2, Headphones, Disc3, Heart } from 'lucide-react';
import { useRoleSelection } from '@/hooks/useRoleSelection';

type AppRole = 'artist' | 'engineer' | 'producer' | 'fan';

interface RoleOption {
  id: AppRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  accentHsl: string;
  keyHint: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'producer',
    title: 'Producer',
    subtitle: 'Craft & Sell',
    description: 'Create beats, build your catalog, and license your sound to artists worldwide.',
    icon: <Disc3 className="w-8 h-8" />,
    accentHsl: '36 95% 55%',   // Amber
    keyHint: '1',
  },
  {
    id: 'artist',
    title: 'Artist',
    subtitle: 'Create & Release',
    description: 'Upload your tracks, find engineers, and release your music to the world.',
    icon: <Mic2 className="w-8 h-8" />,
    accentHsl: '280 65% 60%',  // Purple (primary)
    keyHint: '2',
  },
  {
    id: 'engineer',
    title: 'Engineer',
    subtitle: 'Mix & Earn',
    description: 'Offer your mixing and mastering services, build your clientele, and get paid.',
    icon: <Headphones className="w-8 h-8" />,
    accentHsl: '190 95% 50%',  // Cyan
    keyHint: '3',
  },
  {
    id: 'fan',
    title: 'Fan',
    subtitle: 'Discover & Support',
    description: 'Follow artists early, earn Day 1 status, and unlock rewards as they grow.',
    icon: <Heart className="w-8 h-8" />,
    accentHsl: '340 75% 55%',  // Pink/Rose
    keyHint: '4',
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();
  const { getContributionMessage } = useUnlockContribution();
  const [hoveredRole, setHoveredRole] = useState<AppRole | null>(null);

  const { selectedRole, isSubmitting, selectRole } = useRoleSelection({
    onSuccess: (role) => {
      const contribution = getContributionMessage('user_count', 'Your signup');
      attributionToasts.userJoined(contribution);
      navigate(`/onboarding/${role}`);
    },
  });

  // Keyboard navigation (1-4 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      const keyMap: Record<string, AppRole> = {
        '1': 'producer',
        '2': 'artist',
        '3': 'engineer',
        '4': 'fan',
      };

      if (keyMap[e.key]) {
        selectRole(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, selectRole]);

  // Get active accent for ambient effects
  const activeAccent = hoveredRole
    ? roleOptions.find(r => r.id === hoveredRole)?.accentHsl
    : selectedRole
      ? roleOptions.find(r => r.id === selectedRole)?.accentHsl
      : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-4">
      {/* Cinematic ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />

        {/* Static ambient orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 transition-all duration-1000"
          style={{ background: activeAccent ? `hsl(${activeAccent} / 0.4)` : 'hsl(280 65% 60% / 0.15)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-25 transition-all duration-1000"
          style={{ background: activeAccent ? `hsl(${activeAccent} / 0.3)` : 'hsl(190 95% 50% / 0.1)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15 transition-all duration-1000"
          style={{ background: activeAccent ? `hsl(${activeAccent} / 0.25)` : 'hsl(36 95% 55% / 0.08)' }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{ left: `${5 + i * 4.5}%` }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.6, 0] }}
            transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, ease: 'linear', delay: Math.random() * 8 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Choose Your Path
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            Select how you want to move through Mixxclub
          </motion.p>
        </div>

        {/* Glassmorphic Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {roleOptions.map((role, index) => {
            const isSelected = selectedRole === role.id;
            const isHovered = hoveredRole === role.id;
            const isDimmed = isSubmitting && !isSelected;

            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                onClick={() => handleRoleSelect(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                disabled={isSubmitting}
                className={`
                  mg-panel relative group text-left p-6 transition-all duration-300
                  ${isDimmed ? 'opacity-40 scale-[0.97]' : ''}
                  hover:scale-[1.02] active:scale-[0.98]
                  disabled:cursor-not-allowed
                `}
                style={{
                  borderColor: isSelected
                    ? `hsl(${role.accentHsl} / 0.5)`
                    : isHovered
                      ? `hsl(${role.accentHsl} / 0.25)`
                      : undefined,
                  boxShadow: isSelected
                    ? `0 0 40px -8px hsl(${role.accentHsl} / 0.35)`
                    : isHovered
                      ? `0 0 30px -10px hsl(${role.accentHsl} / 0.2)`
                      : undefined,
                }}
              >
                <div className="mg-pill absolute top-3 right-3 w-6 h-6 flex items-center justify-center">
                  <span className="text-xs text-white/50 font-mono">{role.keyHint}</span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-4">
                  <div
                    className="mg-icon w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300"
                    style={{
                      background: isSelected || isHovered
                        ? `hsl(${role.accentHsl} / 0.2)`
                        : undefined,
                    }}
                  >
                    <span
                      className="transition-colors duration-300"
                      style={{
                        color: isSelected || isHovered
                          ? `hsl(${role.accentHsl})`
                          : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {role.icon}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{role.title}</h3>
                    <p
                      className="text-sm font-medium mb-2 transition-colors duration-300"
                      style={{
                        color: isSelected || isHovered
                          ? `hsl(${role.accentHsl})`
                          : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {role.subtitle}
                    </p>
                    <p className="text-sm text-white/40 leading-relaxed">{role.description}</p>
                  </div>
                </div>

                {/* Loading spinner when selected */}
                {isSelected && isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl"
                    style={{ background: `hsl(${role.accentHsl} / 0.1)` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full animate-spin"
                      style={{
                        border: `3px solid hsl(${role.accentHsl} / 0.2)`,
                        borderTopColor: `hsl(${role.accentHsl})`,
                      }}
                    />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-muted-foreground/50 text-sm mt-8"
        >
          Press <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs">1</kbd> – <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs">4</kbd> or click to select
        </motion.p>
      </motion.div>
    </div>
  );
};

export default RoleSelection;

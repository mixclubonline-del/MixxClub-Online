import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Disc3, Mic2, Headphones, Heart,
  ChevronRight, Check, Sparkles, Users, Music, Zap,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHaptics } from '@/hooks/useHaptics';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';
import { useMobileOnboarding } from '@/hooks/useMobileOnboarding';
import { AppRole } from '@/hooks/useAuthWizard';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

/* ─── Role config ─────────────────────────────────── */
type RoleMeta = {
  id: AppRole;
  label: string;
  tagline: string;
  icon: typeof Disc3;
  accent: string;        // tailwind ring/border
  accentBg: string;      // icon bg
  selectedBg: string;    // card selected bg
  glow: string;
};

const ROLES: RoleMeta[] = [
  {
    id: 'producer', label: 'Producer', tagline: 'I make beats', icon: Disc3,
    accent: 'border-amber-400 shadow-amber-500/30',
    accentBg: 'bg-amber-500/40 text-amber-400',
    selectedBg: 'bg-amber-500/20',
    glow: 'bg-amber-500/10',
  },
  {
    id: 'artist', label: 'Artist', tagline: 'I make music', icon: Mic2,
    accent: 'border-primary shadow-primary/30',
    accentBg: 'bg-primary/40 text-primary',
    selectedBg: 'bg-primary/20',
    glow: 'bg-primary/10',
  },
  {
    id: 'engineer', label: 'Engineer', tagline: 'I mix & master', icon: Headphones,
    accent: 'border-cyan-400 shadow-cyan-500/30',
    accentBg: 'bg-cyan-500/40 text-cyan-400',
    selectedBg: 'bg-cyan-500/20',
    glow: 'bg-cyan-500/10',
  },
  {
    id: 'fan', label: 'Fan', tagline: 'I discover & support', icon: Heart,
    accent: 'border-pink-400 shadow-pink-500/30',
    accentBg: 'bg-pink-500/40 text-pink-400',
    selectedBg: 'bg-pink-500/20',
    glow: 'bg-pink-500/10',
  },
];

const ROLE_ROUTES: Record<AppRole, string> = {
  artist: ROUTES.ONBOARDING_ARTIST,
  engineer: ROUTES.ONBOARDING_ENGINEER,
  producer: ROUTES.ONBOARDING_PRODUCER,
  fan: ROUTES.ONBOARDING_FAN,
};

const TOTAL_CARDS = 6;

/* ─── Component ───────────────────────────────────── */
export function MobileOnboardingFlow() {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const { completeOnboarding } = useMobileOnboarding();
  const { username, setUsername, isChecking, isAvailable, error: usernameError, isValid: usernameValid } = useUsernameValidation();

  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /* ── Navigation ── */
  const canAdvance = useCallback(() => {
    if (step <= 2) return true;          // culture cards
    if (step === 3) return !!selectedRole; // role picker
    if (step === 4) return displayName.trim().length >= 2 && usernameValid; // profile
    return false;
  }, [step, selectedRole, displayName, usernameValid]);

  const goNext = useCallback(() => {
    if (step < TOTAL_CARDS - 1 && canAdvance()) {
      haptics.light();
      setStep((s) => s + 1);
    }
  }, [step, canAdvance, haptics]);

  const goPrev = useCallback(() => {
    if (step > 0 && step <= 2) {
      haptics.light();
      setStep((s) => s - 1);
    }
  }, [step, haptics]);

  const skipToRole = () => {
    haptics.medium();
    setStep(3);
  };

  /* ── Drag handler ── */
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x < -threshold || info.velocity.x < -500) goNext();
    else if (info.offset.x > threshold || info.velocity.x > 500) goPrev();
  };

  /* ── Completion ── */
  const handleFinish = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await completeOnboarding(selectedRole, displayName.trim(), username);
      // Celebration
      setStep(5);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      haptics.success();
      // Auto-navigate after celebration
      setTimeout(() => {
        navigate(ROLE_ROUTES[selectedRole]);
      }, 2400);
    } catch {
      setIsSaving(false);
    }
  };

  /* ── Card content ── */
  const cards: React.ReactNode[] = [
    // Card 0 — Welcome
    <div key="welcome" className="flex flex-col items-center text-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
        <Music className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl font-black text-foreground">
        Welcome to<br />
        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">MixxClub</span>
      </h1>
      <p className="text-muted-foreground text-sm max-w-[280px]">
        The creative ecosystem where artists, engineers, producers & fans build together.
      </p>
    </div>,

    // Card 1 — The Atlanta Model
    <div key="atlanta" className="flex flex-col items-center text-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">The Atlanta Model</h2>
      <p className="text-muted-foreground text-sm max-w-[280px]">
        Inspired by the city that changed music — collaborative studios, real connections, shared success. No gatekeepers.
      </p>
    </div>,

    // Card 2 — Your Crew Awaits
    <div key="crew" className="flex flex-col items-center text-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
        <Users className="w-10 h-10 text-cyan-400" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Your Crew Awaits</h2>
      <p className="text-muted-foreground text-sm max-w-[280px]">
        Thousands of creators already collaborating — live sessions, beat marketplace, fan communities. Jump in.
      </p>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-foreground">2.4K+</span>
          <span>Creators</span>
        </div>
        <div className="w-px bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-foreground">850+</span>
          <span>Sessions</span>
        </div>
        <div className="w-px bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-foreground">$120K+</span>
          <span>Earned</span>
        </div>
      </div>
    </div>,

    // Card 3 — Choose Your Path
    <div key="role" className="flex flex-col items-center text-center gap-5 w-full">
      <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
        <Zap className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Choose Your Path</h2>
      <p className="text-muted-foreground text-xs">What brings you to MixxClub?</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.id;
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => { setSelectedRole(r.id); haptics.medium(); }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-200 active:scale-[0.97]',
                isSelected
                  ? `${r.selectedBg} border-2 ${r.accent} shadow-lg`
                  : 'bg-muted/30 border border-border hover:bg-muted/50'
              )}
            >
              {isSelected && <div className={`absolute inset-0 rounded-xl ${r.glow} animate-pulse`} />}
              <div className={cn(
                'relative z-10 w-12 h-12 rounded-full flex items-center justify-center',
                isSelected ? r.accentBg : 'bg-muted'
              )}>
                <Icon className={cn('w-6 h-6', isSelected ? '' : 'text-muted-foreground')} />
              </div>
              <span className={cn('relative z-10 font-semibold text-sm', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                {r.label}
              </span>
              <span className="relative z-10 text-[10px] text-muted-foreground">{r.tagline}</span>
            </button>
          );
        })}
      </div>
    </div>,

    // Card 4 — Claim Your Name
    <div key="profile" className="flex flex-col items-center text-center gap-5 w-full">
      <h2 className="text-2xl font-bold text-foreground">Claim Your Name</h2>
      <p className="text-muted-foreground text-xs">How should the community know you?</p>
      <div className="w-full space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-foreground text-sm">Display Name</Label>
          <Input
            id="displayName"
            placeholder="Your artist/brand name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-muted/30 border-border"
            maxLength={30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground text-sm">Username</Label>
          <div className="relative">
            <Input
              id="username"
              placeholder="your_unique_handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                'bg-muted/30 border-border pr-10',
                usernameValid && 'border-green-500/50',
                usernameError && 'border-destructive/50'
              )}
              maxLength={20}
            />
            {isChecking && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
            {!isChecking && usernameValid && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            )}
          </div>
          {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
          {isAvailable === false && !usernameError && <p className="text-xs text-destructive">Username taken</p>}
          {usernameValid && <p className="text-xs text-green-500">Available!</p>}
        </div>
      </div>
    </div>,

    // Card 5 — You're In
    <div key="celebrate" className="flex flex-col items-center text-center gap-6">
      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl font-black text-foreground">You're In 🎉</h2>
      <p className="text-muted-foreground text-sm max-w-[260px]">
        Welcome to the club, <span className="text-foreground font-semibold">{displayName || 'creator'}</span>. Let's set up your space.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Taking you in…
      </div>
    </div>,
  ];

  /* ── Render ── */
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

      {/* Skip (culture cards only) */}
      {step <= 2 && (
        <div className="relative z-10 flex justify-end p-4">
          <button
            onClick={skipToRole}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip →
          </button>
        </div>
      )}
      {step > 2 && <div className="h-14" />}

      {/* Card area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            drag={step <= 2 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={step <= 2 ? handleDragEnd : undefined}
            className="w-full max-w-sm"
          >
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl">
              {cards[step]}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + button */}
      <div className="relative z-10 pb-10 px-6 space-y-4">
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted'
              )}
            />
          ))}
        </div>

        {/* CTA button */}
        {step < 5 && (
          <Button
            onClick={step === 4 ? handleFinish : goNext}
            disabled={!canAdvance() || isSaving}
            className="w-full h-12 text-base font-semibold"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up…</>
            ) : step === 4 ? (
              <><Check className="w-4 h-4 mr-2" /> Let's Go</>
            ) : (
              <><ChevronRight className="w-4 h-4 mr-2" /> Continue</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

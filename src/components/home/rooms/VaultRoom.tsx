/**
 * The Vault Room
 * 
 * Room showcasing the community unlock system.
 * Glassmorphic tier cards with unlock animations, hover tooltips, and parallax.
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { Lock, Unlock, Users, Sparkles } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';
import { useCountUp } from '@/hooks/useCountUp';
import { useInView } from '@/hooks/useInView';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import vaultRoomVideo from '@/assets/videos/vault_room.webp';

const TIER_REWARDS = [
  'Community Chat Unlocked',
  'Live Sessions Access',
  'Beat Marketplace Opens',
  'VIP Engineer Pool',
  'Full Studio Access',
];

const TIER_GLOWS: Record<string, { bg: string; border: string; glow: string }> = {
  unlocked: {
    bg: 'rgba(34, 197, 94, 0.08)',
    border: 'rgba(34, 197, 94, 0.25)',
    glow: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
  },
  current: {
    bg: 'hsl(var(--primary) / 0.1)',
    border: 'hsl(var(--primary) / 0.35)',
    glow: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.18) 0%, transparent 70%)',
  },
  locked: {
    bg: 'rgba(255, 255, 255, 0.02)',
    border: 'rgba(255, 255, 255, 0.06)',
    glow: 'none',
  },
};

export function VaultRoom() {
  const { data: milestones, isLoading } = useCommunityMilestones();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counterRef, isInView] = useInView<HTMLDivElement>({ once: true });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const unlockedCount = milestones.filter((m) => m.is_unlocked).length;
  const nextMilestone = milestones.find((m) => !m.is_unlocked);
  const isNearUnlock = nextMilestone && nextMilestone.progress_percentage >= 80;

  const { display: unlockedDisplay } = useCountUp({
    end: unlockedCount,
    enabled: isInView,
    duration: 1200,
  });

  const { display: totalDisplay } = useCountUp({
    end: milestones.length,
    enabled: isInView,
    duration: 1200,
  });

  const tiers = [1, 2, 3, 4, 5].map((tierNum) => {
    const tierMilestones = milestones.filter((m) => {
      if (m.target_value <= 100) return tierNum === 1;
      if (m.target_value <= 250) return tierNum === 2;
      if (m.target_value <= 500) return tierNum === 3;
      if (m.target_value <= 1000) return tierNum === 4;
      return tierNum === 5;
    });

    const isUnlocked = tierMilestones.every((m) => m.is_unlocked);
    const isCurrent = tierMilestones.some((m) => !m.is_unlocked) &&
      tierMilestones.some((m) => m.is_unlocked || m.progress_percentage > 0);

    return { tier: tierNum, milestones: tierMilestones, isUnlocked, isCurrent };
  });

  return (
    <ClubRoom id="vault" className="bg-background relative overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0" ref={sectionRef} style={{ y: bgY }}>
        <img src={vaultRoomVideo} alt="" className="w-full h-full object-cover" style={{ opacity: 0.12 }} loading="lazy" />
        <div className="absolute inset-0 bg-background/85" />
      </motion.div>

      {/* Vault ambient glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative flex flex-col items-center justify-center px-6 py-20 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="mg-pill mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Community Powered</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              THE VAULT
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Every signup brings us closer. Every session counts.
            This isn't our platform—it's <span className="text-primary font-semibold">ours</span>.
          </p>
        </motion.div>

        {/* Tier Timeline with Tooltips */}
        <TooltipProvider delayDuration={200}>
          <motion.div
            className="flex items-center gap-2 md:gap-4 mb-14"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {tiers.map((tier, idx) => {
              const status = tier.isUnlocked ? 'unlocked' : tier.isCurrent ? 'current' : 'locked';
              const palette = TIER_GLOWS[status];

              return (
                <div key={tier.tier} className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="relative w-14 h-14 md:w-18 md:h-18 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer"
                        style={{
                          background: palette.bg,
                          borderColor: palette.border,
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                        }}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * idx }}
                        whileHover={{ scale: 1.15 }}
                      >
                        {/* Inner glow */}
                        <div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{ background: palette.glow }}
                        />

                        {tier.isUnlocked ? (
                          <motion.div
                            initial={{ rotate: -20, scale: 0 }}
                            whileInView={{ rotate: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 * idx, type: 'spring', stiffness: 300 }}
                          >
                            <Unlock className="w-5 h-5 md:w-6 md:h-6 text-green-400 relative z-10" />
                          </motion.div>
                        ) : (
                          <Lock className={cn(
                            'w-5 h-5 md:w-6 md:h-6 relative z-10',
                            tier.isCurrent ? 'text-primary' : 'text-muted-foreground/50'
                          )} />
                        )}

                        <span className="absolute -bottom-6 text-xs font-bold text-muted-foreground">
                          T{tier.tier}
                        </span>

                        {tier.isCurrent && (
                          <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            You are here
                          </motion.div>
                        )}

                        {/* Unlock burst animation for unlocked tiers */}
                        {tier.isUnlocked && (
                          <motion.div
                            className="absolute inset-0 rounded-xl border-2 border-green-400/40 pointer-events-none"
                            initial={{ scale: 1, opacity: 0.6 }}
                            whileInView={{ scale: 1.5, opacity: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 * idx, duration: 0.6 }}
                          />
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold">Tier {tier.tier}</p>
                      <p className="text-muted-foreground">🎁 {TIER_REWARDS[idx]}</p>
                    </TooltipContent>
                  </Tooltip>

                  {idx < tiers.length - 1 && (
                    <div className={cn(
                      'w-4 md:w-8 h-0.5 rounded-full transition-colors',
                      tier.isUnlocked ? 'bg-green-500/40' : 'bg-white/[0.06]'
                    )} />
                  )}
                </div>
              );
            })}
          </motion.div>
        </TooltipProvider>

        {/* Next Milestone Card */}
        {nextMilestone && (
          <motion.div
            className="w-full max-w-md p-6 rounded-2xl border"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'hsl(var(--primary) / 0.2)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 0 60px -20px hsl(var(--primary) / 0.15)',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'hsl(var(--primary) / 0.12)' }}
              >
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Next Unlock</h3>
                <p className="text-sm text-muted-foreground">{nextMilestone.milestone_name}</p>
              </div>
            </div>

            <div className="relative">
              <Progress value={nextMilestone.progress_percentage} className="h-4 mb-3" />
              {/* Glow pulse when near completion */}
              {isNearUnlock && (
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{nextMilestone.current_value} members</span>
              </div>
              <span className="font-bold text-primary">
                {nextMilestone.target_value - nextMilestone.current_value} more needed
              </span>
            </div>

            {nextMilestone.reward_description && (
              <p className="mt-3 text-sm text-center text-primary/80 font-medium">
                🎁 {nextMilestone.reward_description}
              </p>
            )}
          </motion.div>
        )}

        {/* Progress Summary with count-up */}
        <motion.p
          ref={counterRef}
          className="mt-8 text-sm text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-primary font-semibold">{unlockedDisplay}</span> of{' '}
          <span className="text-foreground font-semibold">{totalDisplay}</span> milestones unlocked by the community
        </motion.p>
      </div>
    </ClubRoom>
  );
}

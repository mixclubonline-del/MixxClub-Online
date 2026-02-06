/**
 * The Vault Room
 * 
 * Room showcasing the community unlock system.
 * Visual timeline of unlock tiers with progress.
 */

import { motion } from 'framer-motion';
import { Lock, Unlock, Users, Sparkles } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import studioConsoleImg from '@/assets/promo/studio-console-hero.jpg';

export function VaultRoom() {
  const { data: milestones, isLoading } = useCommunityMilestones();

  const unlockedCount = milestones.filter((m) => m.is_unlocked).length;
  const nextMilestone = milestones.find((m) => !m.is_unlocked);

  // Group milestones by tier (1-5)
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

    return {
      tier: tierNum,
      milestones: tierMilestones,
      isUnlocked,
      isCurrent,
    };
  });

  return (
    <ClubRoom id="vault" className="bg-background relative overflow-hidden">
      {/* Atmospheric background image */}
      <div className="absolute inset-0">
        <img
          src={studioConsoleImg}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.15 }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>
      
      {/* Vault door glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </motion.div>

      <div className="relative flex flex-col items-center justify-center px-6 py-20 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm"
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

        {/* Tier Timeline */}
        <motion.div
          className="flex items-center gap-2 md:gap-4 mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {tiers.map((tier, idx) => (
            <div key={tier.tier} className="flex items-center">
              {/* Tier Node */}
              <motion.div
                className={cn(
                  'relative w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border-2 transition-all backdrop-blur-sm',
                  tier.isUnlocked && 'bg-green-500/20 border-green-500/50',
                  tier.isCurrent && 'bg-primary/20 border-primary/50 animate-pulse',
                  !tier.isUnlocked && !tier.isCurrent && 'bg-muted/20 border-border/50'
                )}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * idx }}
              >
                {tier.isUnlocked ? (
                  <Unlock className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                ) : (
                  <Lock className={cn(
                    'w-5 h-5 md:w-6 md:h-6',
                    tier.isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )} />
                )}

                {/* Tier label */}
                <span className="absolute -bottom-6 text-xs font-bold text-muted-foreground">
                  T{tier.tier}
                </span>

                {/* Current indicator */}
                {tier.isCurrent && (
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    You are here
                  </motion.div>
                )}
              </motion.div>

              {/* Connector */}
              {idx < tiers.length - 1 && (
                <div className={cn(
                  'w-4 md:w-8 h-0.5',
                  tier.isUnlocked ? 'bg-green-500/50' : 'bg-border/50'
                )} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Next Milestone Card — Glassmorphic */}
        {nextMilestone && (
          <motion.div
            className="w-full max-w-md p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Next Unlock</h3>
                <p className="text-sm text-muted-foreground">{nextMilestone.milestone_name}</p>
              </div>
            </div>

            <Progress value={nextMilestone.progress_percentage} className="h-4 mb-3" />

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

        {/* Progress Summary */}
        <motion.p
          className="mt-8 text-sm text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-primary font-semibold">{unlockedCount}</span> of{' '}
          <span className="text-foreground font-semibold">{milestones.length}</span> milestones unlocked by the community
        </motion.p>
      </div>
    </ClubRoom>
  );
}

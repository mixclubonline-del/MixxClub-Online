/**
 * DailyRewardModal — Auto-popup showing streak + today's reward.
 * 
 * Animated coin collection, streak calendar, and claim button.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, Gift, Coins, Loader2, Check, Calendar } from 'lucide-react';
import { useDailyRewards } from '@/hooks/useDailyRewards';

interface DailyRewardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DailyRewardModal({ open, onOpenChange }: DailyRewardModalProps) {
    const {
        claimDailyReward,
        isClaiming,
        canClaim,
        currentStreak,
        longestStreak,
        nextReward,
        todayComplete,
        streakRewards,
    } = useDailyRewards();

    const [claimed, setClaimed] = useState(false);
    const [earnedAmount, setEarnedAmount] = useState(0);

    const handleClaim = async () => {
        try {
            const result = await claimDailyReward();
            setEarnedAmount(result.reward);
            setClaimed(true);
        } catch {
            // Error handled by hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-center justify-center">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Daily Check-In
                    </DialogTitle>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {claimed ? (
                        <motion.div
                            key="claimed"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-5xl mb-3"
                            >
                                🪙
                            </motion.div>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="text-2xl font-bold text-amber-400"
                            >
                                +{earnedAmount}
                            </motion.p>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm text-muted-foreground mt-1"
                            >
                                MixxCoinz earned!
                            </motion.p>
                        </motion.div>
                    ) : (
                        <motion.div key="form" className="space-y-5">
                            {/* Streak display */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    <span className="text-2xl font-bold text-orange-400">{currentStreak}</span>
                                    <span className="text-sm text-muted-foreground">day streak</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    Longest: {longestStreak} days
                                </p>
                            </div>

                            {/* Reward milestones */}
                            <div className="grid grid-cols-3 gap-2">
                                {streakRewards.map((sr) => {
                                    const reached = currentStreak >= sr.day;
                                    const isNext = !reached && (currentStreak + 1 >= sr.day || sr === streakRewards.find(s => s.day > currentStreak));
                                    return (
                                        <div
                                            key={sr.day}
                                            className={cn(
                                                'text-center p-2 rounded-lg border text-xs transition-all',
                                                reached
                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                    : isNext
                                                        ? 'bg-white/5 border-primary/30 text-foreground'
                                                        : 'bg-white/[0.02] border-white/5 text-muted-foreground'
                                            )}
                                        >
                                            <p className="font-bold">{sr.reward} 🪙</p>
                                            <p className="text-[9px] mt-0.5">Day {sr.day}</p>
                                            {reached && <Check className="h-3 w-3 mx-auto mt-0.5 text-green-400" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Today's reward */}
                            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <p className="text-xs text-muted-foreground mb-1">Today's Reward</p>
                                <p className="text-3xl font-bold text-primary">{nextReward} 🪙</p>
                            </div>

                            {/* Claim button */}
                            <Button
                                onClick={handleClaim}
                                disabled={isClaiming || !canClaim}
                                className="w-full gap-2"
                                size="lg"
                            >
                                {isClaiming ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : !canClaim ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Already Checked In
                                    </>
                                ) : (
                                    <>
                                        <Gift className="h-4 w-4" />
                                        Claim Daily Reward
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}

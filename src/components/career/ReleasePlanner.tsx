/**
 * ReleasePlanner — Tier 2 (Advisor) — AI Release Strategy.
 * 
 * Optimal release timing, pre-release checklist, rollout timeline.
 * 500 coinz boost for competitor timing data.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    CalendarDays, Check, Clock, Coins, ChevronRight, Sparkles,
    Music2, Camera, Share2, Mic, Megaphone, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { CAREER_MODULES } from '@/hooks/CareerManagerConfig';

interface RolloutWeek {
    week: number;
    label: string;
    tasks: { name: string; icon: React.ReactNode; done: boolean }[];
}

const SUGGESTED_ROLLOUT: RolloutWeek[] = [
    {
        week: -3, label: '3 Weeks Before',
        tasks: [
            { name: 'Finalize artwork & visuals', icon: <Camera className="h-3 w-3" />, done: false },
            { name: 'Teaser clip for social media', icon: <Share2 className="h-3 w-3" />, done: false },
            { name: 'Submit to playlists', icon: <Music2 className="h-3 w-3" />, done: false },
        ],
    },
    {
        week: -2, label: '2 Weeks Before',
        tasks: [
            { name: 'Announce release date', icon: <Megaphone className="h-3 w-3" />, done: false },
            { name: 'Pre-save campaign', icon: <Star className="h-3 w-3" />, done: false },
            { name: 'Behind-the-scenes content', icon: <Mic className="h-3 w-3" />, done: false },
        ],
    },
    {
        week: -1, label: '1 Week Before',
        tasks: [
            { name: 'Final teaser / snippet', icon: <Music2 className="h-3 w-3" />, done: false },
            { name: 'Email list announcement', icon: <Share2 className="h-3 w-3" />, done: false },
            { name: 'Countdown on profile', icon: <Clock className="h-3 w-3" />, done: false },
        ],
    },
    {
        week: 0, label: 'Release Day',
        tasks: [
            { name: 'Go live everywhere', icon: <Sparkles className="h-3 w-3" />, done: false },
            { name: 'Cross-post all platforms', icon: <Share2 className="h-3 w-3" />, done: false },
            { name: 'Engage with first listeners', icon: <Mic className="h-3 w-3" />, done: false },
        ],
    },
    {
        week: 1, label: 'Week After',
        tasks: [
            { name: 'Share fan reactions', icon: <Star className="h-3 w-3" />, done: false },
            { name: 'Release acoustic / remix', icon: <Music2 className="h-3 w-3" />, done: false },
            { name: 'Analyze first-week data', icon: <CalendarDays className="h-3 w-3" />, done: false },
        ],
    },
];

const BEST_DAYS = [
    { day: 'Friday', score: 95, reason: 'New Music Friday playlists + weekend listening spikes' },
    { day: 'Thursday', score: 78, reason: 'Pre-weekend buzz, early playlist consideration' },
    { day: 'Wednesday', score: 65, reason: 'Mid-week attention, less competition' },
    { day: 'Monday', score: 40, reason: 'Low engagement, people are working' },
];

export function ReleasePlanner() {
    const { canAffordBoost, boostModule } = useCareerManager();
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [isBoosted, setIsBoosted] = useState(false);
    const mod = CAREER_MODULES.release_planner;

    const toggleTask = (taskName: string) => {
        setCheckedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskName)) next.delete(taskName);
            else next.add(taskName);
            return next;
        });
    };

    const totalTasks = SUGGESTED_ROLLOUT.reduce((sum, w) => sum + w.tasks.length, 0);
    const completedTasks = checkedTasks.size;

    const handleBoost = async () => {
        try {
            await boostModule('release_planner');
            setIsBoosted(true);
        } catch {
            // error handled by mutation
        }
    };

    return (
        <div className="space-y-4">
            {/* Release Day Optimizer */}
            <GlassPanel padding="p-4" glow accent="rgba(59, 130, 246, 0.15)">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
                    Optimal Release Days
                </h4>
                <div className="space-y-2">
                    {BEST_DAYS.map(d => (
                        <div key={d.day} className="flex items-center gap-3">
                            <span className="text-xs font-medium w-20 text-foreground">{d.day}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${d.score}%` }}
                                    transition={{ duration: 0.6 }}
                                />
                            </div>
                            <span className="text-[10px] text-foreground font-medium w-8 text-right">{d.score}%</span>
                        </div>
                    ))}
                </div>
                {BEST_DAYS[0] && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                        💡 {BEST_DAYS[0].reason}
                    </p>
                )}
            </GlassPanel>

            {/* Rollout Timeline */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    Release Rollout Timeline
                </h4>
                <p className="text-[10px] text-muted-foreground mb-3">
                    {completedTasks}/{totalTasks} tasks completed
                </p>

                <div className="space-y-2">
                    {SUGGESTED_ROLLOUT.map(week => {
                        const weekChecked = week.tasks.filter(t => checkedTasks.has(t.name)).length;
                        const isExpanded = selectedWeek === week.week;
                        return (
                            <div key={week.week}>
                                <button
                                    onClick={() => setSelectedWeek(isExpanded ? null : week.week)}
                                    className={cn(
                                        'w-full flex items-center gap-2 p-2.5 rounded-lg transition-all text-left',
                                        isExpanded ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/[0.03] hover:bg-white/5'
                                    )}
                                >
                                    <div className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                                        weekChecked === week.tasks.length ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-muted-foreground'
                                    )}>
                                        {weekChecked === week.tasks.length ? '✓' : week.week <= 0 ? `W${Math.abs(week.week)}` : `+${week.week}`}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-foreground">{week.label}</p>
                                        <p className="text-[9px] text-muted-foreground">{weekChecked}/{week.tasks.length} done</p>
                                    </div>
                                    <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="pl-10 pt-1 space-y-1"
                                        >
                                            {week.tasks.map(task => (
                                                <button
                                                    key={task.name}
                                                    onClick={() => toggleTask(task.name)}
                                                    className="flex items-center gap-2 w-full p-1.5 rounded-lg hover:bg-white/5 text-left"
                                                >
                                                    <div className={cn(
                                                        'w-4 h-4 rounded border flex items-center justify-center',
                                                        checkedTasks.has(task.name) ? 'bg-green-500/20 border-green-500/30' : 'border-white/15'
                                                    )}>
                                                        {checkedTasks.has(task.name) && <Check className="h-2.5 w-2.5 text-green-400" />}
                                                    </div>
                                                    <span className="text-muted-foreground">{task.icon}</span>
                                                    <span className={cn(
                                                        'text-[11px]',
                                                        checkedTasks.has(task.name) ? 'text-muted-foreground line-through' : 'text-foreground'
                                                    )}>
                                                        {task.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </GlassPanel>

            {/* Boost CTA */}
            {!isBoosted && (
                <GlassPanel padding="p-3" accent="rgba(234, 179, 8, 0.1)">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-400" />
                                {mod.boostDescription}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{mod.boostCost} coinz</p>
                        </div>
                        <Button
                            size="sm"
                            disabled={!canAffordBoost('release_planner')}
                            onClick={handleBoost}
                            className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20"
                        >
                            <Coins className="h-3 w-3" /> Boost
                        </Button>
                    </div>
                </GlassPanel>
            )}

            {isBoosted && (
                <GlassPanel padding="p-4" glow accent="rgba(234, 179, 8, 0.2)">
                    <h4 className="text-xs font-semibold text-amber-400 mb-2">⚡ Deep Analysis Unlocked</h4>
                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                        <p>🕐 <strong className="text-foreground">Best release window:</strong> Friday 12:00 AM EST (New Music Friday consideration)</p>
                        <p>📊 <strong className="text-foreground">Competitor gap:</strong> Low competition in your genre next 2 weeks</p>
                        <p>🎯 <strong className="text-foreground">Playlist targets:</strong> 3 editorial playlists accepting submissions in your style</p>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}

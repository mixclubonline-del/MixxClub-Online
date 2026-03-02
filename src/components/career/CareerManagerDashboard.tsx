/**
 * CareerManagerDashboard — Main CRM hub for the AI Career Manager.
 * 
 * Module grid showing locked/unlocked/boosted states.
 * Tier progress + career milestones.
 * Gateway to all 8 AI modules.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Brain, Lock, Sparkles, Coins, ChevronRight, Trophy, X,
    Activity, CalendarDays, Users, TrendingUp, Rocket, Target, Calendar, Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel, HubHeader } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import {
    CAREER_TIERS, CAREER_MODULES, TIER_ORDER, CAREER_MILESTONES,
    type CareerModuleId,
} from '@/hooks/CareerManagerConfig';

import { CareerPulse } from './CareerPulse';
import { ReleasePlanner } from './ReleasePlanner';
import { AudienceOracle } from './AudienceOracle';
import { RevenueOptimizer } from './RevenueOptimizer';
import { GrowthEngine } from './GrowthEngine';
import { CampaignManager } from './CampaignManager';
import { ContentCalendar } from './ContentCalendar';
import { EmpireMode } from './EmpireMode';

const MODULE_ICONS: Record<CareerModuleId, React.ReactNode> = {
    career_pulse: <Activity className="h-5 w-5" />,
    release_planner: <CalendarDays className="h-5 w-5" />,
    audience_oracle: <Users className="h-5 w-5" />,
    revenue_optimizer: <TrendingUp className="h-5 w-5" />,
    growth_engine: <Rocket className="h-5 w-5" />,
    campaign_manager: <Target className="h-5 w-5" />,
    content_calendar: <Calendar className="h-5 w-5" />,
    empire_mode: <Crown className="h-5 w-5" />,
};

const MODULE_COMPONENTS: Record<CareerModuleId, React.ReactNode> = {
    career_pulse: <CareerPulse />,
    release_planner: <ReleasePlanner />,
    audience_oracle: <AudienceOracle />,
    revenue_optimizer: <RevenueOptimizer />,
    growth_engine: <GrowthEngine />,
    campaign_manager: <CampaignManager />,
    content_calendar: <ContentCalendar />,
    empire_mode: <EmpireMode />,
};

export function CareerManagerDashboard() {
    const {
        currentTier, nextTier, tierProgress, unlockedModules, lockedModules,
        metrics, milestonesEarned, tierConfig, nextTierConfig,
    } = useCareerManager();

    const [activeModule, setActiveModule] = useState<CareerModuleId | null>(null);

    return (
        <div className="space-y-5">
            <HubHeader
                icon={<Brain className="h-5 w-5 text-cyan-400" />}
                title="AI Career Manager"
                subtitle={`${tierConfig.emoji} ${tierConfig.label} Tier — ${tierConfig.tagline}`}
                accent="rgba(6, 182, 212, 0.5)"
            />

            {/* Module View (when active) */}
            <AnimatePresence>
                {activeModule && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {MODULE_ICONS[activeModule]}
                                <h3 className="text-sm font-bold text-foreground">{CAREER_MODULES[activeModule].name}</h3>
                                <Badge className={cn('text-[8px] border-0', CAREER_TIERS[CAREER_MODULES[activeModule].tier].bgColor, CAREER_TIERS[CAREER_MODULES[activeModule].tier].color)}>
                                    {CAREER_TIERS[CAREER_MODULES[activeModule].tier].emoji} {CAREER_TIERS[CAREER_MODULES[activeModule].tier].label}
                                </Badge>
                            </div>
                            <button onClick={() => setActiveModule(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {MODULE_COMPONENTS[activeModule]}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Dashboard (when no module active) */}
            {!activeModule && (
                <>
                    {/* Tier Progress */}
                    <GlassPanel padding="p-4" glow accent="rgba(6, 182, 212, 0.12)">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                                'bg-gradient-to-br', tierConfig.gradientFrom, tierConfig.gradientTo
                            )}>
                                {tierConfig.emoji}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-base font-bold text-foreground">{tierConfig.label}</h3>
                                    <span className="text-[10px] text-muted-foreground">Tier {TIER_ORDER.indexOf(currentTier) + 1}/5</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mb-2">{tierConfig.description}</p>

                                {nextTierConfig && (
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                            <span className="text-muted-foreground">Next: {nextTierConfig.emoji} {nextTierConfig.label} (Lvl {nextTierConfig.levelRequired})</span>
                                            <span className="text-foreground font-medium">{tierProgress}%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className={cn('h-full rounded-full bg-gradient-to-r', nextTierConfig.gradientFrom, nextTierConfig.gradientTo)}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${tierProgress}%` }}
                                                transition={{ duration: 1 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Module Grid */}
                    <div>
                        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                            AI Modules
                        </h4>

                        {/* Unlocked */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {unlockedModules.map(modId => {
                                const mod = CAREER_MODULES[modId];
                                const tier = CAREER_TIERS[mod.tier];
                                return (
                                    <motion.button
                                        key={modId}
                                        onClick={() => setActiveModule(modId)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            'p-3 rounded-xl border text-left transition-all',
                                            'bg-white/[0.03] border-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5'
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={cn('text-lg')}>{mod.emoji}</span>
                                            <Badge className={cn('text-[7px] border-0', tier.bgColor, tier.color)}>{tier.emoji}</Badge>
                                        </div>
                                        <p className="text-xs font-medium text-foreground">{mod.name}</p>
                                        <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">{mod.description}</p>
                                        {mod.coinzPerUse > 0 && (
                                            <div className="flex items-center gap-0.5 mt-1.5 text-[8px] text-amber-400">
                                                <Coins className="h-2.5 w-2.5" /> {mod.coinzPerUse}/use
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Locked */}
                        {lockedModules.length > 0 && (
                            <>
                                <h4 className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <Lock className="h-3 w-3" /> Locked Modules
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {lockedModules.map(({ id, progress, conditions }) => {
                                        const mod = CAREER_MODULES[id];
                                        const tier = CAREER_TIERS[mod.tier];
                                        return (
                                            <div key={id} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] opacity-60">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                    <Badge className={cn('text-[7px] border-0', tier.bgColor, tier.color)}>{tier.emoji} {tier.label}</Badge>
                                                </div>
                                                <p className="text-xs font-medium text-foreground">{mod.name}</p>
                                                <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{mod.description}</p>
                                                {/* Progress */}
                                                <div className="mt-2">
                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full bg-white/15" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <p className="text-[8px] text-muted-foreground mt-0.5">{progress}% unlocked</p>
                                                </div>
                                                {/* Conditions */}
                                                <div className="flex flex-wrap gap-0.5 mt-1.5">
                                                    {conditions.map(c => (
                                                        <span key={c.label} className={cn('text-[7px] px-1 py-0.5 rounded',
                                                            c.met ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-muted-foreground'
                                                        )}>
                                                            {c.met ? '✓' : '○'} {c.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Career Milestones */}
                    <GlassPanel padding="p-4">
                        <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                            Career Milestones
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                            {CAREER_MILESTONES.slice(0, 6).map(milestone => {
                                const earned = milestonesEarned.includes(milestone.id);
                                return (
                                    <div key={milestone.id} className={cn(
                                        'text-center p-2 rounded-lg',
                                        earned ? 'bg-amber-500/10' : 'bg-white/[0.02]'
                                    )}>
                                        <span className="text-lg">{earned ? milestone.emoji : '🔒'}</span>
                                        <p className={cn('text-[9px] mt-0.5', earned ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                                            {milestone.label}
                                        </p>
                                        {earned ? (
                                            <p className="text-[7px] text-amber-400">+{milestone.coinzReward}🪙</p>
                                        ) : (
                                            <p className="text-[7px] text-muted-foreground">{milestone.description}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {CAREER_MILESTONES.length > 6 && (
                            <p className="text-[9px] text-muted-foreground text-center mt-2">
                                +{CAREER_MILESTONES.length - 6} more milestones to discover
                            </p>
                        )}
                    </GlassPanel>
                </>
            )}
        </div>
    );
}

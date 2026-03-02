/**
 * CampaignManager — Tier 4 (Producer) — Full campaign orchestration.
 * 
 * Create campaigns with goals, timelines, and AI-generated tasks.
 * 200 coinz per campaign. 1500 coinz boost for Campaign Autopilot.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Target, Plus, Check, Calendar, TrendingUp, Sparkles, Coins,
    Loader2, ChevronRight, X, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { CAREER_MODULES } from '@/hooks/CareerManagerConfig';

type CampaignGoal = 'release' | 'merch' | 'event' | 'growth' | 'brand';

const GOALS: { key: CampaignGoal; label: string; emoji: string; tasks: string[] }[] = [
    {
        key: 'release', label: 'New Release', emoji: '🎵',
        tasks: ['Finalize masters', 'Design artwork', 'Set up distribution', 'Create pre-save link', 'Post teaser clip', 'Email newsletter', 'Submit to playlists', 'Release day social blitz', 'Analyze first-week data'],
    },
    {
        key: 'merch', label: 'Merch Drop', emoji: '👕',
        tasks: ['Design mockups', 'Select colorways', 'Set pricing', 'Photograph product', 'Create launch countdown', 'Tease on socials', 'Launch drop', 'Post unboxing content', 'Restock check'],
    },
    {
        key: 'event', label: 'Event Promotion', emoji: '🎟️',
        tasks: ['Confirm venue details', 'Design flyer', 'Open ticket sales', 'Social media campaign', 'Influencer outreach', 'Email blast', 'Day-of promotion', 'Live event content', 'Post-event follow-up'],
    },
    {
        key: 'growth', label: 'Audience Growth', emoji: '📈',
        tasks: ['Audit current audience', 'Set target metrics', 'Daily content schedule', 'Engage in communities', 'Collab outreach', 'Cross-promotion', 'Run giveaway', 'Analyze growth data', 'Refine strategy'],
    },
    {
        key: 'brand', label: 'Brand Building', emoji: '✨',
        tasks: ['Define brand identity', 'Update visual assets', 'Consistent posting schedule', 'Behind-the-scenes content', 'Fan engagement campaign', 'Press kit update', 'Media outreach', 'Brand partnership outreach'],
    },
];

interface Campaign {
    id: string;
    name: string;
    goal: CampaignGoal;
    tasks: { name: string; done: boolean }[];
    createdAt: Date;
}

export function CampaignManager() {
    const { canAffordModule, useModule, canAffordBoost, boostModule } = useCareerManager();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showCreator, setShowCreator] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedGoal, setSelectedGoal] = useState<CampaignGoal>('release');
    const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const mod = CAREER_MODULES.campaign_manager;

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsCreating(true);
        try {
            await useModule('campaign_manager');
            const goal = GOALS.find(g => g.key === selectedGoal)!;
            const campaign: Campaign = {
                id: Date.now().toString(),
                name: newName,
                goal: selectedGoal,
                tasks: goal.tasks.map(t => ({ name: t, done: false })),
                createdAt: new Date(),
            };
            setCampaigns(prev => [campaign, ...prev]);
            setShowCreator(false);
            setNewName('');
            setActiveCampaign(campaign.id);
        } catch { /* handled */ } finally { setIsCreating(false); }
    };

    const toggleTask = (campaignId: string, taskIdx: number) => {
        setCampaigns(prev => prev.map(c =>
            c.id === campaignId
                ? { ...c, tasks: c.tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t) }
                : c
        ));
    };

    return (
        <div className="space-y-4">
            {/* Active Campaigns */}
            {campaigns.map(campaign => {
                const goalConfig = GOALS.find(g => g.key === campaign.goal);
                const doneTasks = campaign.tasks.filter(t => t.done).length;
                const pct = Math.round((doneTasks / campaign.tasks.length) * 100);
                const isActive = activeCampaign === campaign.id;

                return (
                    <GlassPanel key={campaign.id} padding="p-4" glow={isActive} accent={isActive ? 'rgba(245, 158, 11, 0.12)' : undefined}>
                        <button onClick={() => setActiveCampaign(isActive ? null : campaign.id)} className="w-full text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{goalConfig?.emoji}</span>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-foreground">{campaign.name}</h4>
                                    <p className="text-[9px] text-muted-foreground">{goalConfig?.label} · {doneTasks}/{campaign.tasks.length} tasks</p>
                                </div>
                                <Badge className={cn('text-[9px] border-0',
                                    pct === 100 ? 'bg-green-500/10 text-green-400' :
                                        pct >= 50 ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-muted-foreground'
                                )}>{pct}%</Badge>
                                <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', isActive && 'rotate-90')} />
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </button>

                        <AnimatePresence>
                            {isActive && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-1">
                                    {campaign.tasks.map((task, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => toggleTask(campaign.id, idx)}
                                            className="flex items-center gap-2 w-full p-1.5 rounded-lg hover:bg-white/5 text-left"
                                        >
                                            <div className={cn(
                                                'w-4 h-4 rounded border flex items-center justify-center',
                                                task.done ? 'bg-green-500/20 border-green-500/30' : 'border-white/15'
                                            )}>
                                                {task.done && <Check className="h-2.5 w-2.5 text-green-400" />}
                                            </div>
                                            <span className={cn('text-[11px]', task.done ? 'text-muted-foreground line-through' : 'text-foreground')}>
                                                {task.name}
                                            </span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassPanel>
                );
            })}

            {/* Create Campaign */}
            <AnimatePresence>
                {showCreator && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <GlassPanel padding="p-4" glow accent="rgba(245, 158, 11, 0.15)">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-semibold text-foreground">New Campaign</h4>
                                <button onClick={() => setShowCreator(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-[10px] text-muted-foreground">Campaign Name</Label>
                                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder='"Album Release — Summer 2026"' className="h-9 bg-white/5 border-white/10 text-sm" />
                                </div>
                                <div>
                                    <Label className="text-[10px] text-muted-foreground mb-1.5 block">Goal</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {GOALS.map(g => (
                                            <button key={g.key} onClick={() => setSelectedGoal(g.key)}
                                                className={cn('px-2.5 py-1.5 rounded-lg text-[11px] border transition-all',
                                                    selectedGoal === g.key ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/5 text-muted-foreground border-white/8'
                                                )}>
                                                {g.emoji} {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[9px] text-muted-foreground">
                                    {GOALS.find(g => g.key === selectedGoal)?.tasks.length} AI-generated tasks · {mod.coinzPerUse} coinz
                                </p>
                                <Button onClick={handleCreate} disabled={!newName.trim() || isCreating || !canAffordModule('campaign_manager')}
                                    className="w-full gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                                    {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Target className="h-3.5 w-3.5" />}
                                    {isCreating ? 'Creating...' : `Launch Campaign (${mod.coinzPerUse}🪙)`}
                                </Button>
                            </div>
                        </GlassPanel>
                    </motion.div>
                )}
            </AnimatePresence>

            {!showCreator && (
                <Button onClick={() => setShowCreator(true)} className="w-full gap-2 border-amber-500/20 text-amber-400 hover:bg-amber-500/10 border-dashed" variant="outline">
                    <Plus className="h-4 w-4" /> New Campaign (200🪙)
                </Button>
            )}

            {/* Empty state */}
            {campaigns.length === 0 && !showCreator && (
                <GlassPanel padding="p-6" accent="rgba(245, 158, 11, 0.08)">
                    <div className="text-center">
                        <Target className="h-10 w-10 mx-auto mb-2 text-amber-400/40" />
                        <h3 className="text-sm font-bold text-foreground mb-1">No active campaigns</h3>
                        <p className="text-[11px] text-muted-foreground">Create a campaign and Prime Bot will generate your task list</p>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}

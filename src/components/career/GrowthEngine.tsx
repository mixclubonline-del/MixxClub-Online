/**
 * GrowthEngine — Tier 3 (Strategist) — Growth optimization.
 * 
 * Weekly report card, collab matching, viral potential scoring.
 * 800 coinz boost for personalized 30-day viral strategy.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Rocket, ArrowUp, ArrowDown, Users, Music2, Coins, Sparkles, Handshake, Flame, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { CAREER_MODULES } from '@/hooks/CareerManagerConfig';

const REPORT_CARD = [
    { metric: 'Followers', value: '+142', trend: 18, icon: <Users className="h-3 w-3" />, grade: 'A' },
    { metric: 'Streams', value: '+2.1K', trend: 12, icon: <Music2 className="h-3 w-3" />, grade: 'B+' },
    { metric: 'Revenue', value: '+$340', trend: 25, icon: <Coins className="h-3 w-3" />, grade: 'A-' },
    { metric: 'Engagement', value: '8.2%', trend: -3, icon: <Flame className="h-3 w-3" />, grade: 'B' },
];

const COLLAB_MATCHES = [
    { name: 'NeonVibes', genre: 'Lo-fi', overlap: 34, fans: '2.1K', compatibility: 92 },
    { name: 'CloudWalker', genre: 'Ambient', overlap: 28, fans: '5.4K', compatibility: 87 },
    { name: 'BassDrifter', genre: 'Chill Hop', overlap: 22, fans: '1.8K', compatibility: 81 },
];

const VIRAL_TRACKS = [
    { title: 'Midnight Drive', score: 88, reason: 'High replay rate + trending genre tags', trend: 'rising' },
    { title: 'Neon Dreams', score: 72, reason: 'Strong hook in first 30s, good for short-form', trend: 'stable' },
    { title: 'Lost Signal', score: 45, reason: 'Niche audience, but high completion rate', trend: 'stable' },
];

const GROWTH_TIPS = [
    { tip: 'Post a studio session clip between 9-11PM tonight', impact: 'high', reason: 'Your fans are most active during this window' },
    { tip: 'Collab with NeonVibes — 34% audience overlap', impact: 'high', reason: 'Highest compatibility match with growing audience' },
    { tip: 'Create a TikTok with the hook from "Midnight Drive"', impact: 'medium', reason: 'Track has 88% viral potential score' },
    { tip: 'Run a 500-coinz giveaway to your top streamers', impact: 'medium', reason: 'Increases superfan loyalty and word-of-mouth' },
];

export function GrowthEngine() {
    const { canAffordBoost, boostModule } = useCareerManager();
    const [isBoosted, setIsBoosted] = useState(false);
    const mod = CAREER_MODULES.growth_engine;

    const handleBoost = async () => {
        try { await boostModule('growth_engine'); setIsBoosted(true); } catch { /* handled */ }
    };

    return (
        <div className="space-y-4">
            {/* Weekly Report Card */}
            <GlassPanel padding="p-4" glow accent="rgba(168, 85, 247, 0.12)">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Rocket className="h-3.5 w-3.5 text-purple-400" />
                    Weekly Growth Report
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {REPORT_CARD.map(r => (
                        <div key={r.metric} className="p-2.5 bg-white/[0.03] rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1 text-muted-foreground">{r.icon}<span className="text-[10px]">{r.metric}</span></div>
                                <Badge className={cn('text-[9px] border-0',
                                    r.grade.startsWith('A') ? 'bg-green-500/10 text-green-400' :
                                        r.grade.startsWith('B') ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                                )}>{r.grade}</Badge>
                            </div>
                            <p className="text-sm font-bold text-foreground">{r.value}</p>
                            <span className={cn('text-[9px] flex items-center gap-0.5',
                                r.trend > 0 ? 'text-green-400' : 'text-red-400'
                            )}>
                                {r.trend > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                                {Math.abs(r.trend)}% vs last week
                            </span>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Collab Matching */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Handshake className="h-3.5 w-3.5 text-blue-400" />
                    Collab Recommendations
                </h4>
                <div className="space-y-2">
                    {COLLAB_MATCHES.map(match => (
                        <div key={match.name} className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-lg">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-foreground">
                                {match.name[0]}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-foreground">{match.name}</p>
                                <p className="text-[9px] text-muted-foreground">{match.genre} · {match.fans} fans · {match.overlap}% overlap</p>
                            </div>
                            <div className="text-right">
                                <p className={cn('text-sm font-bold',
                                    match.compatibility >= 90 ? 'text-green-400' : match.compatibility >= 80 ? 'text-blue-400' : 'text-amber-400'
                                )}>{match.compatibility}%</p>
                                <p className="text-[8px] text-muted-foreground">match</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Viral Potential */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    Viral Potential Scores
                </h4>
                <div className="space-y-2">
                    {VIRAL_TRACKS.map(track => (
                        <div key={track.title} className="p-2.5 bg-white/[0.03] rounded-lg">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-foreground">🎵 {track.title}</span>
                                <Badge className={cn('text-[9px] border-0',
                                    track.score >= 80 ? 'bg-green-500/10 text-green-400' :
                                        track.score >= 60 ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-muted-foreground'
                                )}>{track.score}/100</Badge>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        background: track.score >= 80 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                                            track.score >= 60 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.15)',
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${track.score}%` }}
                                    transition={{ duration: 0.6 }}
                                />
                            </div>
                            <p className="text-[9px] text-muted-foreground">{track.reason}</p>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* AI Growth Tips */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    Growth Actions
                </h4>
                <div className="space-y-1.5">
                    {GROWTH_TIPS.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-white/[0.03] rounded-lg">
                            <Badge className={cn('text-[8px] mt-0.5 shrink-0 border-0',
                                tip.impact === 'high' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                            )}>{tip.impact}</Badge>
                            <div>
                                <p className="text-[11px] text-foreground">{tip.tip}</p>
                                <p className="text-[9px] text-muted-foreground">{tip.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Boost */}
            {!isBoosted ? (
                <GlassPanel padding="p-3" accent="rgba(234, 179, 8, 0.1)">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-400" /> {mod.boostDescription}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{mod.boostCost} coinz</p>
                        </div>
                        <Button size="sm" disabled={!canAffordBoost('growth_engine')} onClick={handleBoost}
                            className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20">
                            <Coins className="h-3 w-3" /> Boost
                        </Button>
                    </div>
                </GlassPanel>
            ) : (
                <GlassPanel padding="p-4" glow accent="rgba(168, 85, 247, 0.2)">
                    <h4 className="text-xs font-semibold text-purple-400 mb-2">🚀 30-Day Viral Strategy Unlocked</h4>
                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                        <p>📱 <strong className="text-foreground">Week 1:</strong> 5 TikToks using "Midnight Drive" hook — target 50K views</p>
                        <p>🤝 <strong className="text-foreground">Week 2:</strong> NeonVibes collab announcement + behind-the-scenes</p>
                        <p>🎵 <strong className="text-foreground">Week 3:</strong> Remix contest with 1000 coinz prize → UGC amplification</p>
                        <p>📡 <strong className="text-foreground">Week 4:</strong> Virtual listening party for new release → convert viewers to buyers</p>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}

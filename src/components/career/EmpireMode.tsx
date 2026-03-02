/**
 * EmpireMode — Tier 5 (Mogul) — Multi-artist empire management.
 * 
 * Roster view, cross-promotion detection, mentor matching, industry positioning.
 * 500 coinz per session. 2000 coinz boost for Industry Intel.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Crown, Users, TrendingUp, DollarSign, Handshake, Sparkles, Coins,
    Target, Star, ArrowRight, Plus, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { CAREER_MODULES } from '@/hooks/CareerManagerConfig';

const DEMO_ROSTER = [
    { name: 'You', genre: 'Lo-fi', revenue: 4440, streams: 12500, growth: 18, tier: 'Producer' as const },
    { name: 'NeonVibes', genre: 'Chill Hop', revenue: 2100, streams: 8200, growth: 24, tier: 'Strategist' as const },
    { name: 'CloudWalker', genre: 'Ambient', revenue: 890, streams: 3400, growth: 45, tier: 'Advisor' as const },
];

const CROSS_PROMOS = [
    { artist1: 'You', artist2: 'NeonVibes', opportunity: 'Joint EP release — 34% audience overlap, combined reach 20K', impact: 'high' },
    { artist1: 'NeonVibes', artist2: 'CloudWalker', opportunity: 'Playlist swap — complementary genres, minimal overlap', impact: 'medium' },
    { artist1: 'You', artist2: 'CloudWalker', opportunity: 'Remix exchange — introduce ambient textures to your lo-fi audience', impact: 'medium' },
];

const MENTORS_AVAILABLE = [
    { name: 'BeatMogul92', level: 9, specialty: 'Revenue optimization', mentees: 3, maxMentees: 5 },
    { name: 'VinylQueen', level: 10, specialty: 'Physical media strategy', mentees: 2, maxMentees: 3 },
];

const SCOUTS_SEEKING = [
    { name: 'FreshBeats_01', level: 1, genre: 'Hip-Hop', goal: 'First 100 streams', joined: '2 weeks ago' },
    { name: 'MelodyMaker', level: 2, genre: 'R&B', goal: 'First sale', joined: '1 month ago' },
];

export function EmpireMode() {
    const { canAffordBoost, boostModule } = useCareerManager();
    const [isBoosted, setIsBoosted] = useState(false);
    const mod = CAREER_MODULES.empire_mode;

    const totalRevenue = DEMO_ROSTER.reduce((sum, a) => sum + a.revenue, 0);
    const totalStreams = DEMO_ROSTER.reduce((sum, a) => sum + a.streams, 0);

    const handleBoost = async () => {
        try { await boostModule('empire_mode'); setIsBoosted(true); } catch { /* handled */ }
    };

    return (
        <div className="space-y-4">
            {/* Empire Stats */}
            <GlassPanel padding="p-4" glow accent="rgba(6, 182, 212, 0.15)">
                <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-cyan-300" />
                    <h3 className="text-sm font-bold text-foreground">Your Empire</h3>
                    <Badge className="text-[8px] bg-cyan-500/10 text-cyan-300 border-0">👑 Mogul</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold text-foreground">{DEMO_ROSTER.length}</p>
                        <p className="text-[8px] text-muted-foreground">Artists</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
                        <p className="text-[8px] text-muted-foreground">Combined Revenue</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold text-cyan-400">{(totalStreams / 1000).toFixed(1)}K</p>
                        <p className="text-[8px] text-muted-foreground">Total Streams</p>
                    </div>
                </div>
            </GlassPanel>

            {/* Roster */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-400" />
                    Artist Roster
                </h4>
                <div className="space-y-2">
                    {DEMO_ROSTER.map((artist, idx) => (
                        <div key={artist.name} className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-lg">
                            <div className={cn(
                                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
                                idx === 0 ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-cyan-300' : 'bg-white/5 text-muted-foreground'
                            )}>
                                {artist.name[0]}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-medium text-foreground">{artist.name}</p>
                                    <Badge className="text-[7px] bg-white/5 text-muted-foreground border-0">{artist.tier}</Badge>
                                </div>
                                <p className="text-[9px] text-muted-foreground">{artist.genre} · ${artist.revenue.toLocaleString()} rev · {(artist.streams / 1000).toFixed(1)}K streams</p>
                            </div>
                            <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                                <TrendingUp className="h-2.5 w-2.5" /> {artist.growth}%
                            </span>
                        </div>
                    ))}
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2 gap-1 text-[10px] border-dashed border-white/10">
                    <Plus className="h-3 w-3" /> Add Artist to Roster
                </Button>
            </GlassPanel>

            {/* Cross-Promotion */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Handshake className="h-3.5 w-3.5 text-purple-400" />
                    Cross-Promotion Opportunities
                </h4>
                <div className="space-y-2">
                    {CROSS_PROMOS.map((promo, idx) => (
                        <div key={idx} className="p-2.5 bg-white/[0.03] rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[10px] font-medium text-foreground">{promo.artist1}</span>
                                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="text-[10px] font-medium text-foreground">{promo.artist2}</span>
                                <Badge className={cn('text-[7px] border-0 ml-auto',
                                    promo.impact === 'high' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                                )}>{promo.impact}</Badge>
                            </div>
                            <p className="text-[9px] text-muted-foreground">{promo.opportunity}</p>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Mentor Matching */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    Mentor Matching
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">Available Mentors</p>
                        {MENTORS_AVAILABLE.map(m => (
                            <div key={m.name} className="p-2 bg-white/[0.03] rounded-lg mb-1.5">
                                <p className="text-[11px] font-medium text-foreground">👑 {m.name}</p>
                                <p className="text-[8px] text-muted-foreground">Lvl {m.level} · {m.specialty}</p>
                                <p className="text-[8px] text-muted-foreground">{m.mentees}/{m.maxMentees} mentees</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">Scouts Seeking Mentors</p>
                        {SCOUTS_SEEKING.map(s => (
                            <div key={s.name} className="p-2 bg-white/[0.03] rounded-lg mb-1.5">
                                <p className="text-[11px] font-medium text-foreground">🔍 {s.name}</p>
                                <p className="text-[8px] text-muted-foreground">Lvl {s.level} · {s.genre}</p>
                                <p className="text-[8px] text-muted-foreground">Goal: {s.goal}</p>
                            </div>
                        ))}
                    </div>
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
                        <Button size="sm" disabled={!canAffordBoost('empire_mode')} onClick={handleBoost}
                            className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20">
                            <Coins className="h-3 w-3" /> Boost
                        </Button>
                    </div>
                </GlassPanel>
            ) : (
                <GlassPanel padding="p-4" glow accent="rgba(6, 182, 212, 0.2)">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-2">🏆 Industry Intel Unlocked</h4>
                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                        <p>🗺️ <strong className="text-foreground">Market position:</strong> Your roster occupies a unique niche — chill/atmospheric with high engagement</p>
                        <p>📈 <strong className="text-foreground">Trending:</strong> Lo-fi/ambient crossover is trending +47% this quarter</p>
                        <p>💰 <strong className="text-foreground">Label benchmark:</strong> Your collective revenue is top 12% of indie rosters at this size</p>
                        <p>🎯 <strong className="text-foreground">Next move:</strong> Sign one R&B artist to diversify — 28% of your audience also listens to R&B</p>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}

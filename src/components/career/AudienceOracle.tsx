/**
 * AudienceOracle — Tier 2 (Advisor) — Fan Insights Engine.
 * 
 * Demographics, superfan identification, engagement heatmap.
 * 300 coinz boost for psychographic profiling.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Users, MapPin, Clock, Heart, Sparkles, Coins, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { CAREER_MODULES } from '@/hooks/CareerManagerConfig';

const DEMO_DEMOGRAPHICS = [
    { age: '18-24', pct: 42, color: 'bg-cyan-500' },
    { age: '25-34', pct: 31, color: 'bg-blue-500' },
    { age: '35-44', pct: 15, color: 'bg-purple-500' },
    { age: '45+', pct: 12, color: 'bg-violet-500' },
];

const DEMO_LOCATIONS = [
    { city: 'Los Angeles', pct: 18, emoji: '🌴' },
    { city: 'New York', pct: 14, emoji: '🗽' },
    { city: 'Atlanta', pct: 11, emoji: '🍑' },
    { city: 'Chicago', pct: 8, emoji: '🌬️' },
    { city: 'Houston', pct: 7, emoji: '🤠' },
];

const DEMO_TIMES = [
    { hour: '6AM', val: 5 }, { hour: '9AM', val: 15 }, { hour: '12PM', val: 25 },
    { hour: '3PM', val: 20 }, { hour: '6PM', val: 40 }, { hour: '9PM', val: 65 },
    { hour: '12AM', val: 45 }, { hour: '3AM', val: 10 },
];

const DEMO_SUPERFANS = [
    { name: 'BeatLover99', streams: 142, purchases: 5, coinzGifted: 300, loyaltyDays: 45 },
    { name: 'VibeChaser', streams: 98, purchases: 3, coinzGifted: 150, loyaltyDays: 38 },
    { name: 'NightOwlMusic', streams: 87, purchases: 2, coinzGifted: 200, loyaltyDays: 52 },
];

export function AudienceOracle() {
    const { canAffordBoost, boostModule } = useCareerManager();
    const [isBoosted, setIsBoosted] = useState(false);
    const mod = CAREER_MODULES.audience_oracle;
    const maxTime = Math.max(...DEMO_TIMES.map(t => t.val));

    const handleBoost = async () => {
        try {
            await boostModule('audience_oracle');
            setIsBoosted(true);
        } catch { /* handled */ }
    };

    return (
        <div className="space-y-4">
            {/* Demographics */}
            <GlassPanel padding="p-4" glow accent="rgba(139, 92, 246, 0.12)">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-purple-400" />
                    Audience Demographics
                </h4>
                <div className="space-y-2">
                    {DEMO_DEMOGRAPHICS.map(d => (
                        <div key={d.age} className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground w-10">{d.age}</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className={cn('h-full rounded-full', d.color)}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${d.pct}%` }}
                                    transition={{ duration: 0.6 }}
                                />
                            </div>
                            <span className="text-[11px] text-foreground font-medium w-8 text-right">{d.pct}%</span>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Top Locations */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-400" />
                    Top Fan Locations
                </h4>
                <div className="space-y-1.5">
                    {DEMO_LOCATIONS.map((loc, idx) => (
                        <div key={loc.city} className="flex items-center gap-2 p-1.5 bg-white/[0.03] rounded-lg">
                            <span className="text-sm">{loc.emoji}</span>
                            <span className="text-xs text-foreground flex-1">{loc.city}</span>
                            <Badge variant="outline" className="text-[9px] border-white/10">{loc.pct}%</Badge>
                            {idx === 0 && <Badge className="text-[8px] bg-amber-500/10 text-amber-400 border-0">📍 Top</Badge>}
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Best Posting Times */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    Fan Activity Heatmap
                </h4>
                <div className="flex items-end gap-1 h-20">
                    {DEMO_TIMES.map(t => (
                        <div key={t.hour} className="flex-1 flex flex-col items-center gap-0.5">
                            <motion.div
                                className="w-full rounded-t-sm"
                                style={{
                                    background: t.val >= 50 ? 'linear-gradient(180deg, #22d3ee, #0891b2)' :
                                        t.val >= 30 ? 'linear-gradient(180deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.08)',
                                }}
                                initial={{ height: 0 }}
                                animate={{ height: `${(t.val / maxTime) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                            <span className="text-[7px] text-muted-foreground">{t.hour}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                    🔥 Peak: <strong className="text-foreground">9 PM–12 AM</strong> — best time to post or drop content
                </p>
            </GlassPanel>

            {/* Superfans */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-pink-400" />
                    Superfans
                </h4>
                <div className="space-y-2">
                    {DEMO_SUPERFANS.map((fan, idx) => (
                        <div key={fan.name} className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-lg">
                            <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                                idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-muted-foreground'
                            )}>
                                {idx === 0 ? <Crown className="h-3.5 w-3.5" /> : idx + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-foreground">{fan.name}</p>
                                <p className="text-[9px] text-muted-foreground">
                                    {fan.streams} streams · {fan.purchases} purchases · {fan.coinzGifted}🪙 gifted · {fan.loyaltyDays}d loyalty
                                </p>
                            </div>
                        </div>
                    ))}
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
                            disabled={!canAffordBoost('audience_oracle')}
                            onClick={handleBoost}
                            className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20"
                        >
                            <Coins className="h-3 w-3" /> Boost
                        </Button>
                    </div>
                </GlassPanel>
            )}

            {isBoosted && (
                <GlassPanel padding="p-4" glow accent="rgba(139, 92, 246, 0.2)">
                    <h4 className="text-xs font-semibold text-purple-400 mb-2">🧬 Audience DNA Unlocked</h4>
                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                        <p>🎵 <strong className="text-foreground">Genre affinity:</strong> 82% lo-fi/chill, 45% R&B, 38% indie</p>
                        <p>🎬 <strong className="text-foreground">Content preference:</strong> Fans engage 3× more with studio session clips vs static posts</p>
                        <p>💬 <strong className="text-foreground">Sentiment:</strong> 94% positive — fans describe your music as "atmospheric" and "emotional"</p>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}

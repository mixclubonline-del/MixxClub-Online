import { useState } from 'react';
import { Lock, Trophy, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePerformanceBadges, type Badge } from '@/hooks/usePerformanceBadges';
import { cn } from '@/lib/utils';

interface PerformanceBadgesProps {
    partnerId?: string;
    compact?: boolean;
}

const TIER_COLORS: Record<Badge['tier'], string> = {
    bronze: 'from-amber-700/20 to-amber-600/10 border-amber-600/30',
    silver: 'from-slate-300/20 to-slate-400/10 border-slate-400/30',
    gold: 'from-yellow-500/20 to-yellow-400/10 border-yellow-500/30',
    platinum: 'from-cyan-400/20 to-teal-300/10 border-cyan-400/30',
};

const TIER_GLOW: Record<Badge['tier'], string> = {
    bronze: 'shadow-amber-600/20',
    silver: 'shadow-slate-400/20',
    gold: 'shadow-yellow-500/30',
    platinum: 'shadow-cyan-400/30',
};

function BadgeCard({ badge }: { badge: Badge }) {
    return (
        <div
            className={cn(
                'relative p-4 rounded-xl border transition-all duration-300',
                'bg-gradient-to-br',
                badge.unlocked ? TIER_COLORS[badge.tier] : 'from-muted/30 to-muted/10 border-border',
                badge.unlocked && `shadow-lg ${TIER_GLOW[badge.tier]}`,
                !badge.unlocked && 'opacity-60'
            )}
        >
            {/* Badge icon */}
            <div className="flex items-start gap-3">
                <div className={cn(
                    'text-3xl w-12 h-12 flex items-center justify-center rounded-full',
                    badge.unlocked
                        ? 'bg-background/50 animate-[pulse_3s_ease-in-out_infinite]'
                        : 'bg-muted/50 grayscale'
                )}>
                    {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-sm">{badge.name}</h4>
                        <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider',
                            badge.tier === 'bronze' && 'bg-amber-600/20 text-amber-600',
                            badge.tier === 'silver' && 'bg-slate-400/20 text-slate-400',
                            badge.tier === 'gold' && 'bg-yellow-500/20 text-yellow-600',
                            badge.tier === 'platinum' && 'bg-cyan-400/20 text-cyan-400',
                        )}>
                            {badge.tier}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>

                    {/* Progress bar (only for locked badges) */}
                    {!badge.unlocked && (
                        <div className="mt-2">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>{badge.requirement}</span>
                                <span>{badge.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary/60 rounded-full transition-all duration-700"
                                    style={{ width: `${badge.progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {badge.unlocked && badge.unlockedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PerformanceBadges({ partnerId, compact = false }: PerformanceBadgesProps) {
    const { data, isLoading } = usePerformanceBadges(partnerId);
    const [expanded, setExpanded] = useState(!compact);

    if (isLoading) {
        return (
            <Card className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-48 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
                </div>
            </Card>
        );
    }

    if (!data) return null;

    const { badges, summary } = data;
    const unlockedBadges = badges.filter((b) => b.unlocked);
    const lockedBadges = badges.filter((b) => !b.unlocked);
    const displayBadges = compact && !expanded ? unlockedBadges.slice(0, 4) : badges;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-bold">Partnership Badges</h3>
                    <span className="text-sm text-muted-foreground">
                        {summary.unlocked}/{summary.total}
                    </span>
                </div>
                {compact && (
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="gap-1">
                        {expanded ? <><ChevronUp className="w-4 h-4" /> Less</> : <><ChevronDown className="w-4 h-4" /> All</>}
                    </Button>
                )}
            </div>

            {/* Progress overview */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(summary.unlocked / summary.total) * 100}%` }}
                />
            </div>

            {/* Badge grid */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Unlocked first, then locked */}
                {displayBadges
                    .sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))
                    .map((badge) => (
                        <BadgeCard key={badge.id} badge={badge} />
                    ))}
            </div>

            {compact && !expanded && lockedBadges.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    +{lockedBadges.length} more badges to unlock
                </p>
            )}
        </div>
    );
}

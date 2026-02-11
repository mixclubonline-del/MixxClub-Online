import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    DollarSign, TrendingUp, ArrowRightLeft, Gift,
    Coins, RefreshCw, CheckCircle, Clock, Loader2,
    Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAutoSplitRevenue, DistributionRecord, SplitParty } from '@/hooks/useAutoSplitRevenue';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AutoSplitDashboardProps {
    userType: 'artist' | 'engineer' | 'producer';
}

const ROLE_COLORS: Record<string, string> = {
    artist: 'text-indigo-400',
    engineer: 'text-emerald-400',
    producer: 'text-amber-400',
};

const SOURCE_LABELS: Record<string, { label: string; icon: typeof DollarSign }> = {
    manual: { label: 'Manual', icon: DollarSign },
    beat_sale: { label: 'Beat Sale', icon: DollarSign },
    session: { label: 'Session', icon: ArrowRightLeft },
    gift_revenue: { label: 'Gift Revenue', icon: Gift },
    stream: { label: 'Stream', icon: TrendingUp },
};

export const AutoSplitDashboard = ({ userType }: AutoSplitDashboardProps) => {
    const { distributions, loading, fetchDistributionHistory } = useAutoSplitRevenue();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized) {
            fetchDistributionHistory();
            setInitialized(true);
        }
    }, [fetchDistributionHistory, initialized]);

    // Compute summary stats
    const totalDistributed = distributions.reduce((sum, d) => sum + d.totalAmount, 0);
    const myEarnings = distributions.reduce((sum, d) => {
        const myParty = d.parties.find(p => p.role === userType);
        return sum + (myParty?.amount ?? 0);
    }, 0);
    const giftRevenue = distributions
        .filter(d => d.source === 'gift_revenue')
        .reduce((sum, d) => sum + d.totalAmount, 0);

    const formatCurrency = (v: number) => `$${v.toFixed(2)}`;

    return (
        <Card className="border-border/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Auto-Split Revenue
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchDistributionHistory()}
                        disabled={loading}
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <DollarSign className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-lg font-bold">{formatCurrency(totalDistributed)}</p>
                        <p className="text-xs text-muted-foreground">Total Distributed</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 text-center">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold text-primary">{formatCurrency(myEarnings)}</p>
                        <p className="text-xs text-muted-foreground">Your Share</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/5 text-center">
                        <Gift className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                        <p className="text-lg font-bold text-amber-500">{formatCurrency(giftRevenue)}</p>
                        <p className="text-xs text-muted-foreground">Gift Revenue</p>
                    </div>
                </div>

                <Separator />

                {/* Distribution Feed */}
                <div className="space-y-2">
                    <p className="text-sm font-medium">Recent Distributions</p>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : distributions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Coins className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No distributions yet</p>
                            <p className="text-xs">Revenue will appear here when auto-split triggers</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                            {distributions.map((d, i) => (
                                <DistributionItem key={d.id} record={d} index={i} userType={userType} />
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// --- Sub-component ---

const DistributionItem = ({
    record,
    index,
    userType,
}: {
    record: DistributionRecord;
    index: number;
    userType: string;
}) => {
    const source = SOURCE_LABELS[record.source] || SOURCE_LABELS.manual;
    const SourceIcon = source.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-lg border border-border/30 bg-card/50 space-y-2"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SourceIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">${record.totalAmount.toFixed(2)}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {source.label}
                    </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {record.status === 'completed' ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                        <Clock className="w-3 h-3 text-yellow-500" />
                    )}
                    {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                </div>
            </div>

            {/* Split Bars */}
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                {record.parties.map((party) => (
                    <div
                        key={party.role}
                        style={{ width: `${party.percentage}%` }}
                        className={cn(
                            'h-full rounded-full transition-all',
                            party.role === 'artist' && 'bg-indigo-400',
                            party.role === 'engineer' && 'bg-emerald-400',
                            party.role === 'producer' && 'bg-amber-400',
                        )}
                    />
                ))}
            </div>

            {/* Party Labels */}
            <div className="flex items-center gap-3 text-xs">
                {record.parties.map((party) => (
                    <span
                        key={party.role}
                        className={cn(
                            'flex items-center gap-1',
                            ROLE_COLORS[party.role],
                            party.role === userType && 'font-semibold',
                        )}
                    >
                        <span className={cn(
                            'w-2 h-2 rounded-full',
                            party.role === 'artist' && 'bg-indigo-400',
                            party.role === 'engineer' && 'bg-emerald-400',
                            party.role === 'producer' && 'bg-amber-400',
                        )} />
                        {party.role}: {party.percentage}% (${party.amount.toFixed(2)})
                    </span>
                ))}
            </div>

            {record.description && (
                <p className="text-xs text-muted-foreground truncate">{record.description}</p>
            )}
        </motion.div>
    );
};

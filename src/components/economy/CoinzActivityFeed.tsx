/**
 * CoinzActivityFeed — Live feed of coinz flowing in the community.
 * 
 * Shows recent transactions: tips, unlocks, purchases, milestones.
 * Creates the ambient feeling that coinz are always flowing.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Unlock, ShoppingCart, Trophy, Gift, Coins, Zap } from 'lucide-react';

interface FeedItem {
    id: string;
    type: string;
    amount: number;
    description: string;
    timestamp: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    tip: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    gated_content_sale: { icon: Unlock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    vault_purchase: { icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    mission: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    gift: { icon: Gift, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    creator_payout: { icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10' },
    auto_earn: { icon: Coins, color: 'text-amber-300', bg: 'bg-amber-500/10' },
};

function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

interface CoinzActivityFeedProps {
    limit?: number;
    compact?: boolean;
    className?: string;
}

export function CoinzActivityFeed({ limit = 10, compact = false, className }: CoinzActivityFeedProps) {
    const feedQuery = useQuery({
        queryKey: ['coinz-activity-feed', limit],
        queryFn: async () => {
            // Fetch recent community-wide transactions (tips, unlocks, gifts — public-facing ones)
            const { data, error } = await supabase
                .from('mixx_transactions')
                .select('id, source, amount, description, created_at')
                .in('source', ['tip', 'gated_content_sale', 'gift', 'creator_payout', 'mission'])
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(tx => ({
                id: tx.id,
                type: tx.source,
                amount: tx.amount,
                description: tx.description || '',
                timestamp: tx.created_at,
            })) as FeedItem[];
        },
        staleTime: 15000,
        refetchInterval: 30000, // Refresh every 30s for "live" feel
    });

    const items = feedQuery.data || [];

    if (items.length === 0) return null;

    return (
        <div className={cn('space-y-1.5', className)}>
            {!compact && (
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs font-medium text-muted-foreground">Live Coinz Flow</p>
                </div>
            )}

            <AnimatePresence initial={false}>
                {items.map((item, i) => {
                    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.auto_earn;
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: i * 0.03 }}
                            className={cn(
                                'flex items-center gap-2 py-1.5 px-2 rounded-lg',
                                compact ? '' : 'bg-white/[0.02]'
                            )}
                        >
                            <div className={cn('w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0', config.bg)}>
                                <Icon className={cn('h-3 w-3', config.color)} />
                            </div>
                            <p className="text-[11px] text-muted-foreground flex-1 truncate">
                                {item.description || `${item.amount} coinz earned`}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-[10px] font-mono text-amber-400">+{item.amount}</span>
                                <span className="text-[9px] text-muted-foreground/50">{timeAgo(item.timestamp)}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

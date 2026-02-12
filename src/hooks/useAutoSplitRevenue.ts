/**
 * useAutoSplitRevenue Hook
 *
 * Automatic multi-party revenue distribution engine.
 * Supports 2-way (artist/engineer) and 3-way (artist/engineer/producer) splits.
 * Includes gift-revenue conversion from live stream coins.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// --- Types ---

export interface SplitParty {
    userId: string;
    role: 'artist' | 'engineer' | 'producer';
    percentage: number;
    amount: number;
}

export interface DistributionRecord {
    id: string;
    partnershipId: string;
    totalAmount: number;
    parties: SplitParty[];
    source: 'manual' | 'beat_sale' | 'session' | 'gift_revenue' | 'stream';
    description?: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
}

export interface GiftRevenueBreakdown {
    streamId: string;
    totalCoins: number;
    coinRate: number; // dollars per coin
    totalRevenue: number;
    parties: SplitParty[];
}

const COIN_TO_DOLLAR_RATE = 0.01; // 1 coin = $0.01

// --- Hook ---

export const useAutoSplitRevenue = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [distributions, setDistributions] = useState<DistributionRecord[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Distribute revenue across partnership members.
     * Reads the partnership's split percentages, computes each party's share,
     * and records it in revenue_splits.
     */
    const distributeRevenue = useCallback(async (
        partnershipId: string,
        totalAmount: number,
        source: DistributionRecord['source'] = 'manual',
        description?: string,
    ): Promise<DistributionRecord | null> => {
        if (!user?.id) return null;

        try {
            // Fetch partnership to get parties + split %
            const { data: partnership, error: pErr } = await supabase
                .from('partnerships')
                .select('*')
                .eq('id', partnershipId)
                .single();

            if (pErr || !partnership) throw pErr || new Error('Partnership not found');

            // Build split parties
            const parties: SplitParty[] = [];

            // Artist
            if (partnership.artist_id) {
                const artistPct = partnership.artist_split
                    ?? partnership.artist_percentage
                    ?? (partnership.engineer_id ? 50 : 100);
                parties.push({
                    userId: partnership.artist_id,
                    role: 'artist',
                    percentage: artistPct,
                    amount: Math.round(totalAmount * artistPct) / 100,
                });
            }

            // Engineer
            if (partnership.engineer_id) {
                const engineerPct = partnership.engineer_split
                    ?? partnership.engineer_percentage
                    ?? 50;
                parties.push({
                    userId: partnership.engineer_id,
                    role: 'engineer',
                    percentage: engineerPct,
                    amount: Math.round(totalAmount * engineerPct) / 100,
                });
            }

            // Producer (3-way)
            if (partnership.producer_id) {
                const producerPct = partnership.producer_percentage ?? 33;
                parties.push({
                    userId: partnership.producer_id,
                    role: 'producer',
                    percentage: producerPct,
                    amount: Math.round(totalAmount * producerPct) / 100,
                });
            }

            // Record revenue split
            const { error: splitErr } = await supabase
                .from('revenue_splits')
                .insert({
                    partnership_id: partnershipId,
                    total_amount: totalAmount,
                    artist_percentage: parties.find(p => p.role === 'artist')?.percentage ?? 0,
                    engineer_percentage: parties.find(p => p.role === 'engineer')?.percentage ?? 0,
                    description: description || `Auto-split: ${source.replace('_', ' ')}`,
                    status: 'completed',
                });

            if (splitErr) throw splitErr;

            // Update partnership earnings columns
            for (const party of parties) {
                const earningsCol = `${party.role}_earnings`;
                const { data: current } = await supabase
                    .from('partnerships')
                    .select(earningsCol)
                    .eq('id', partnershipId)
                    .single();

                if (current) {
                    const currentEarnings = (current as Record<string, number>)[earningsCol] || 0;
                    await supabase
                        .from('partnerships')
                        .update({ [earningsCol]: currentEarnings + party.amount })
                        .eq('id', partnershipId);
                }
            }

            const record: DistributionRecord = {
                id: crypto.randomUUID(),
                partnershipId,
                totalAmount,
                parties,
                source,
                description,
                status: 'completed',
                createdAt: new Date().toISOString(),
            };

            setDistributions(prev => [record, ...prev]);

            toast({
                title: '💰 Revenue Distributed',
                description: `$${totalAmount.toFixed(2)} split across ${parties.length} parties`,
            });

            return record;
        } catch (err) {
            console.error('Distribution error:', err);
            toast({
                title: 'Distribution Failed',
                description: err instanceof Error ? err.message : 'Unknown error',
                variant: 'destructive',
            });
            return null;
        }
    }, [user?.id, toast]);

    /**
     * Convert gift coins from a stream into revenue and auto-split
     * to all collaborators attached to the stream's session.
     */
    const distributeGiftRevenue = useCallback(async (
        streamId: string,
    ): Promise<GiftRevenueBreakdown | null> => {
        if (!user?.id) return null;

        try {
            // Aggregate gift coins for this stream
            const { data: giftData, error: giftErr } = await supabase
                .from('stream_gifts')
                .select('quantity, gift:live_gifts(coin_cost)')
                .eq('stream_id', streamId);

            if (giftErr) throw giftErr;

            const totalCoins = (giftData || []).reduce((sum, g) => {
                const cost = (g.gift as unknown as { coin_cost: number })?.coin_cost ?? 0;
                return sum + (g.quantity * cost);
            }, 0);

            if (totalCoins <= 0) {
                toast({
                    title: 'No Gift Revenue',
                    description: 'No gifts were received on this stream.',
                });
                return null;
            }

            const totalRevenue = totalCoins * COIN_TO_DOLLAR_RATE;

            // Find session attached to stream
            const { data: streamData } = await supabase
                .from('live_streams')
                .select('session_id')
                .eq('id', streamId)
                .single();

            // Find partnership from session
            let partnershipId: string | null = null;
            if (streamData?.session_id) {
                const { data: sessionData } = await supabase
                    .from('collaboration_sessions')
                    .select('session_state')
                    .eq('id', streamData.session_id)
                    .single();

                const state = sessionData?.session_state as Record<string, unknown> | null;
                if (state?.partnership_id) {
                    partnershipId = state.partnership_id as string;
                }
            }

            if (partnershipId) {
                // Full auto-split through partnership
                const record = await distributeRevenue(partnershipId, totalRevenue, 'gift_revenue', `Gift revenue from stream (${totalCoins} coins)`);
                return record ? {
                    streamId,
                    totalCoins,
                    coinRate: COIN_TO_DOLLAR_RATE,
                    totalRevenue,
                    parties: record.parties,
                } : null;
            }

            // No partnership — creator keeps 100%
            const parties: SplitParty[] = [{
                userId: user.id,
                role: 'producer',
                percentage: 100,
                amount: totalRevenue,
            }];

            return {
                streamId,
                totalCoins,
                coinRate: COIN_TO_DOLLAR_RATE,
                totalRevenue,
                parties,
            };
        } catch (err) {
            console.error('Gift revenue error:', err);
            toast({
                title: 'Gift Revenue Error',
                description: err instanceof Error ? err.message : 'Unknown error',
                variant: 'destructive',
            });
            return null;
        }
    }, [user?.id, distributeRevenue, toast]);

    /**
     * Fetch distribution history for the current user.
     */
    const fetchDistributionHistory = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);

        try {
            const { data: splits, error: splitErr } = await supabase
                .from('revenue_splits')
                .select('*, partnerships!inner(artist_id, engineer_id, producer_id, artist_split, engineer_split, producer_percentage, artist_percentage, engineer_percentage)')
                .or(
                    `partnerships.artist_id.eq.${user.id},partnerships.engineer_id.eq.${user.id},partnerships.producer_id.eq.${user.id}`
                )
                .order('created_at', { ascending: false })
                .limit(20);

            if (splitErr) throw splitErr;

            const records: DistributionRecord[] = (splits || []).map((s) => {
                const p = (s as Record<string, unknown>).partnerships as Record<string, unknown> | null;
                const parties: SplitParty[] = [];

                if (p?.artist_id) {
                    parties.push({
                        userId: p.artist_id as string,
                        role: 'artist',
                        percentage: s.artist_percentage ?? 0,
                        amount: s.total_amount * (s.artist_percentage ?? 0) / 100,
                    });
                }
                if (p?.engineer_id) {
                    parties.push({
                        userId: p.engineer_id as string,
                        role: 'engineer',
                        percentage: s.engineer_percentage ?? 0,
                        amount: s.total_amount * (s.engineer_percentage ?? 0) / 100,
                    });
                }
                if (p?.producer_id) {
                    const producerPct = (p.producer_percentage as number) ?? 0;
                    parties.push({
                        userId: p.producer_id as string,
                        role: 'producer',
                        percentage: producerPct,
                        amount: s.total_amount * producerPct / 100,
                    });
                }

                return {
                    id: s.id,
                    partnershipId: s.partnership_id,
                    totalAmount: s.total_amount,
                    parties,
                    source: (s.description?.includes('Gift') ? 'gift_revenue' : 'manual') as DistributionRecord['source'],
                    description: s.description,
                    status: s.status as DistributionRecord['status'],
                    createdAt: s.created_at,
                };
            });

            setDistributions(records);
        } catch (err) {
            console.error('Error fetching distributions:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    return {
        distributions,
        loading,
        distributeRevenue,
        distributeGiftRevenue,
        fetchDistributionHistory,
    };
};

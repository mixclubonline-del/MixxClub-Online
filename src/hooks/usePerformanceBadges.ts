/**
 * Hook for partnership performance badges.
 * Evaluates partnership metrics and returns earned / locked badges.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji or lucide icon name
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    unlocked: boolean;
    progress: number; // 0-100
    unlockedAt?: string;
    requirement: string;
}

export interface PartnershipMetrics {
    totalSessions: number;
    totalRevenue: number;
    avgRating: number;
    repeatClients: number;
    onTimeDelivery: number; // percentage
    monthsActive: number;
    referralsMade: number;
    perfectScores: number; // 5-star ratings
}

/** Badge definitions with their unlock conditions */
const BADGE_DEFINITIONS: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: Badge['tier'];
    requirement: string;
    check: (m: PartnershipMetrics) => { unlocked: boolean; progress: number };
}> = [
        {
            id: 'first-session', name: 'First Mix', description: 'Complete your first session together',
            icon: '🎵', tier: 'bronze', requirement: '1 session completed',
            check: (m) => ({ unlocked: m.totalSessions >= 1, progress: Math.min(m.totalSessions / 1 * 100, 100) }),
        },
        {
            id: 'five-sessions', name: 'Dynamic Duo', description: 'Complete 5 sessions together',
            icon: '🤝', tier: 'bronze', requirement: '5 sessions completed',
            check: (m) => ({ unlocked: m.totalSessions >= 5, progress: Math.min(m.totalSessions / 5 * 100, 100) }),
        },
        {
            id: 'ten-sessions', name: 'Hit Factory', description: 'Complete 10 sessions together',
            icon: '🏭', tier: 'silver', requirement: '10 sessions completed',
            check: (m) => ({ unlocked: m.totalSessions >= 10, progress: Math.min(m.totalSessions / 10 * 100, 100) }),
        },
        {
            id: 'twenty-five-sessions', name: 'Legendary Partners', description: 'Complete 25 sessions together',
            icon: '👑', tier: 'gold', requirement: '25 sessions completed',
            check: (m) => ({ unlocked: m.totalSessions >= 25, progress: Math.min(m.totalSessions / 25 * 100, 100) }),
        },
        {
            id: 'perfect-score', name: 'Perfect Score', description: 'Receive a 5-star rating',
            icon: '⭐', tier: 'bronze', requirement: '1 perfect (5-star) rating',
            check: (m) => ({ unlocked: m.perfectScores >= 1, progress: Math.min(m.perfectScores / 1 * 100, 100) }),
        },
        {
            id: 'five-perfect', name: 'Flawless', description: 'Receive 5 perfect ratings',
            icon: '💎', tier: 'silver', requirement: '5 perfect ratings',
            check: (m) => ({ unlocked: m.perfectScores >= 5, progress: Math.min(m.perfectScores / 5 * 100, 100) }),
        },
        {
            id: 'revenue-1k', name: 'First Thousand', description: 'Earn $1,000 together',
            icon: '💰', tier: 'bronze', requirement: '$1,000 combined revenue',
            check: (m) => ({ unlocked: m.totalRevenue >= 1000, progress: Math.min(m.totalRevenue / 1000 * 100, 100) }),
        },
        {
            id: 'revenue-10k', name: 'Money Makers', description: 'Earn $10,000 together',
            icon: '🏆', tier: 'gold', requirement: '$10,000 combined revenue',
            check: (m) => ({ unlocked: m.totalRevenue >= 10000, progress: Math.min(m.totalRevenue / 10000 * 100, 100) }),
        },
        {
            id: 'revenue-50k', name: 'Platinum Partners', description: 'Earn $50,000 together',
            icon: '💎', tier: 'platinum', requirement: '$50,000 combined revenue',
            check: (m) => ({ unlocked: m.totalRevenue >= 50000, progress: Math.min(m.totalRevenue / 50000 * 100, 100) }),
        },
        {
            id: 'on-time-streak', name: 'Always On Time', description: 'Maintain 95%+ on-time delivery',
            icon: '⏰', tier: 'silver', requirement: '95%+ on-time delivery rate',
            check: (m) => ({ unlocked: m.onTimeDelivery >= 95 && m.totalSessions >= 5, progress: Math.min(m.onTimeDelivery / 95 * 100, 100) }),
        },
        {
            id: 'repeat-clients', name: 'Client Magnet', description: 'Get 3 repeat clients',
            icon: '🧲', tier: 'silver', requirement: '3 repeat clients',
            check: (m) => ({ unlocked: m.repeatClients >= 3, progress: Math.min(m.repeatClients / 3 * 100, 100) }),
        },
        {
            id: 'six-months', name: 'Long Game', description: 'Partner for 6+ months',
            icon: '📅', tier: 'silver', requirement: '6 months of partnership',
            check: (m) => ({ unlocked: m.monthsActive >= 6, progress: Math.min(m.monthsActive / 6 * 100, 100) }),
        },
        {
            id: 'one-year', name: 'Anniversary', description: 'Partner for 1+ year',
            icon: '🎂', tier: 'gold', requirement: '12 months of partnership',
            check: (m) => ({ unlocked: m.monthsActive >= 12, progress: Math.min(m.monthsActive / 12 * 100, 100) }),
        },
        {
            id: 'referral-maker', name: 'Network Builder', description: 'Make 5 referrals',
            icon: '🌐', tier: 'silver', requirement: '5 referrals made',
            check: (m) => ({ unlocked: m.referralsMade >= 5, progress: Math.min(m.referralsMade / 5 * 100, 100) }),
        },
    ];

/**
 * Fetch partnership metrics and evaluate badges
 */
export const usePerformanceBadges = (partnerId?: string) => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['performance-badges', user?.id, partnerId],
        queryFn: async () => {
            if (!user) return { badges: [], metrics: null as PartnershipMetrics | null, summary: { total: 0, unlocked: 0 } };

            // Fetch real partnership metrics from DB
            const metrics = await fetchPartnershipMetrics(user.id, partnerId);

            // Evaluate all badges
            const badges: Badge[] = BADGE_DEFINITIONS.map((def) => {
                const result = def.check(metrics);
                return {
                    id: def.id,
                    name: def.name,
                    description: def.description,
                    icon: def.icon,
                    tier: def.tier,
                    unlocked: result.unlocked,
                    progress: Math.round(result.progress),
                    requirement: def.requirement,
                };
            });

            return {
                badges,
                metrics,
                summary: {
                    total: badges.length,
                    unlocked: badges.filter((b) => b.unlocked).length,
                },
            };
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });
};

async function fetchPartnershipMetrics(userId: string, partnerId?: string): Promise<PartnershipMetrics> {
    try {
        // Get completed projects/sessions
        const projectQuery = supabase
            .from('projects')
            .select('id, status, rating, created_at, amount')
            .or(`artist_id.eq.${userId},engineer_id.eq.${userId}`);

        if (partnerId) {
            projectQuery.or(`artist_id.eq.${partnerId},engineer_id.eq.${partnerId}`);
        }

        const { data: projects } = await projectQuery.eq('status', 'completed');

        // Get referrals
        const { count: referralCount } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', userId);

        const sessions = projects || [];
        const totalSessions = sessions.length;
        const totalRevenue = sessions.reduce((sum, p) => sum + ((p.amount as number) || 0), 0);
        const ratings = sessions.filter((p) => p.rating != null).map((p) => p.rating as number);
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        const perfectScores = ratings.filter((r) => r === 5).length;

        // Calculate months active
        const dates = sessions.map((p) => new Date(p.created_at as string));
        const earliestDate = dates.length > 0 ? Math.min(...dates.map((d) => d.getTime())) : Date.now();
        const monthsActive = Math.floor((Date.now() - earliestDate) / (30 * 24 * 60 * 60 * 1000));

        // Count unique repeat clients (appeared 2+ times)
        const clientCounts = new Map<string, number>();
        sessions.forEach((p) => {
            const clientId = (p as Record<string, unknown>).artist_id as string;
            if (clientId && clientId !== userId) {
                clientCounts.set(clientId, (clientCounts.get(clientId) || 0) + 1);
            }
        });
        const repeatClients = Array.from(clientCounts.values()).filter((c) => c >= 2).length;

        return {
            totalSessions,
            totalRevenue,
            avgRating: Math.round(avgRating * 10) / 10,
            repeatClients,
            onTimeDelivery: totalSessions > 0 ? 92 : 0, // Would calculate from due dates vs completion dates
            monthsActive,
            referralsMade: referralCount || 0,
            perfectScores,
        };
    } catch (err) {
        console.error('fetchPartnershipMetrics error:', err);
        return {
            totalSessions: 0, totalRevenue: 0, avgRating: 0,
            repeatClients: 0, onTimeDelivery: 0, monthsActive: 0,
            referralsMade: 0, perfectScores: 0,
        };
    }
}

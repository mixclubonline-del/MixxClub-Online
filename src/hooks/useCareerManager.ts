/**
 * useCareerManager — Core hook for the AI Career Manager.
 * 
 * Integrates with:
 * - useGamification → determines career tier
 * - useUnlockables → tracks module unlock progress
 * - useMixxWallet → coinz costs for AI actions
 * - useAchievements → celebrates career milestones
 * 
 * This is the brain behind Prime Bot's career intelligence.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { useToast } from '@/hooks/use-toast';
import {
    CAREER_TIERS, CAREER_MODULES, HEALTH_METRICS, CAREER_MILESTONES, TIER_ORDER,
    type CareerTier, type CareerModuleId, type HealthMetric, type AIAdvice,
} from './CareerManagerConfig';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface CareerMetrics {
    uploads: number;
    sales: number;
    streams: number;
    collabs: number;
    revenue: number;
    coinz_earned: number;
    community_contribution: number;
    /** Per-metric health scores (0-100) */
    health: Record<HealthMetric, number>;
    /** Composite health score */
    healthScore: number;
}

export interface CareerState {
    currentTier: CareerTier;
    nextTier: CareerTier | null;
    tierProgress: number;
    unlockedModules: CareerModuleId[];
    lockedModules: { id: CareerModuleId; progress: number; conditions: { label: string; current: number; target: number; met: boolean }[] }[];
    metrics: CareerMetrics;
    recentAdvice: AIAdvice[];
    milestonesEarned: string[];
    milestonesAvailable: typeof CAREER_MILESTONES;
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useCareerManager() {
    const { user } = useAuth();
    const { progress } = useGamification();
    const { totalBalance, spendCoinz, canAfford } = useMixxWallet();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ── Fetch career metrics ──────────

    const metricsQuery = useQuery({
        queryKey: ['career-metrics', user?.id],
        queryFn: async (): Promise<CareerMetrics> => {
            if (!user?.id) return defaultMetrics();

            // Fetch from multiple tables in parallel
            const [
                { count: uploadCount },
                { count: saleCount },
                { data: revenueData },
                { count: collabCount },
                { data: walletData },
            ] = await Promise.all([
                (supabase.from as any)('tracks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                (supabase.from as any)('storefront_orders').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
                (supabase.from as any)('storefront_orders').select('total_amount').eq('seller_id', user.id),
                (supabase.from as any)('collaborations').select('id', { count: 'exact', head: true }).or(`creator_id.eq.${user.id},collaborator_id.eq.${user.id}`),
                supabase.from('mixx_wallets').select('total_earned').eq('user_id', user.id).maybeSingle(),
            ]);

            const totalRevenue = (revenueData as any[])?.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0) || 0;
            const streams = Math.floor(Math.random() * 500); // Placeholder until stream tracking exists

            const health = calculateHealth({
                uploads: uploadCount || 0,
                sales: saleCount || 0,
                streams,
                revenue: totalRevenue,
            });

            return {
                uploads: uploadCount || 0,
                sales: saleCount || 0,
                streams,
                collabs: collabCount || 0,
                revenue: totalRevenue,
                coinz_earned: walletData?.total_earned || 0,
                community_contribution: 0, // Tracked via unlockables
                health,
                healthScore: Object.entries(health).reduce((sum, [key, val]) => {
                    const metric = HEALTH_METRICS[key as HealthMetric];
                    return sum + (val * (metric?.weight || 0.2));
                }, 0),
            };
        },
        enabled: !!user?.id,
        staleTime: 60000,
    });

    // ── Fetch earned milestones ──────

    const milestonesQuery = useQuery({
        queryKey: ['career-milestones', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await (supabase.from as any)('career_milestones')
                .select('milestone_id')
                .eq('user_id', user.id);
            return (data || []).map((m: any) => m.milestone_id as string);
        },
        enabled: !!user?.id,
    });

    // ── Determine current tier ──────

    const metrics = metricsQuery.data || defaultMetrics();

    const getCurrentTier = (): CareerTier => {
        let highestTier: CareerTier = 'scout';
        for (const tierKey of TIER_ORDER) {
            const tier = CAREER_TIERS[tierKey];
            if (progress.level < tier.levelRequired) break;

            const conditionsMet = tier.unlockConditions.every(cond => {
                const current = getMetricValue(cond.metric, metrics);
                return current >= cond.target;
            });

            if (conditionsMet) highestTier = tierKey;
            else break;
        }
        return highestTier;
    };

    const currentTier = getCurrentTier();
    const currentTierIndex = TIER_ORDER.indexOf(currentTier);
    const nextTier = currentTierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentTierIndex + 1] : null;

    // ── Module access ──────────────

    const getUnlockedModules = (): CareerModuleId[] => {
        const modules: CareerModuleId[] = [];
        for (let i = 0; i <= currentTierIndex; i++) {
            modules.push(...CAREER_TIERS[TIER_ORDER[i]].modules);
        }
        return modules;
    };

    const unlockedModules = getUnlockedModules();

    const getLockedModules = () => {
        const locked: CareerState['lockedModules'] = [];
        for (let i = currentTierIndex + 1; i < TIER_ORDER.length; i++) {
            const tier = CAREER_TIERS[TIER_ORDER[i]];
            for (const modId of tier.modules) {
                const conditions = tier.unlockConditions.map(cond => ({
                    label: cond.label,
                    current: getMetricValue(cond.metric, metrics),
                    target: cond.target,
                    met: getMetricValue(cond.metric, metrics) >= cond.target,
                }));
                const metCount = conditions.filter(c => c.met).length;
                const totalCount = conditions.length;
                const levelMet = progress.level >= tier.levelRequired;
                const totalReqs = totalCount + 1; // +1 for level requirement
                const metReqs = metCount + (levelMet ? 1 : 0);
                locked.push({ id: modId, progress: Math.round((metReqs / totalReqs) * 100), conditions });
            }
        }
        return locked;
    };

    const canUseModule = (moduleId: CareerModuleId): boolean => {
        return unlockedModules.includes(moduleId);
    };

    // ── Tier progress ──────────────

    const getTierProgress = (): number => {
        if (!nextTier) return 100;
        const next = CAREER_TIERS[nextTier];
        const conditions = next.unlockConditions;
        if (conditions.length === 0) {
            return progress.level >= next.levelRequired ? 100 : (progress.level / next.levelRequired) * 100;
        }
        const levelProgress = Math.min(1, progress.level / next.levelRequired);
        const condProgress = conditions.reduce((sum, cond) => {
            const current = getMetricValue(cond.metric, metrics);
            return sum + Math.min(1, current / cond.target);
        }, 0) / conditions.length;
        return Math.round(((levelProgress + condProgress) / 2) * 100);
    };

    // ── Use module (with coinz cost) ──

    const useModuleMutation = useMutation({
        mutationFn: async (moduleId: CareerModuleId) => {
            const mod = CAREER_MODULES[moduleId];
            if (!canUseModule(moduleId)) throw new Error('Module not unlocked');

            if (mod.coinzPerUse > 0) {
                if (!canAfford(mod.coinzPerUse)) throw new Error(`Need ${mod.coinzPerUse} coinz to use ${mod.name}`);
                await spendCoinz({
                    amount: mod.coinzPerUse,
                    source: 'career_manager',
                    description: `Used ${mod.name}`,
                    referenceType: 'career_module',
                    referenceId: moduleId,
                });
            }

            // Log usage
            if (user?.id) {
                await (supabase.from as any)('career_module_usage').insert({
                    user_id: user.id,
                    module_id: moduleId,
                    coinz_spent: mod.coinzPerUse,
                });
            }

            return { moduleId, name: mod.name };
        },
        onSuccess: ({ name }) => {
            toast({ title: `🧠 ${name} activated`, description: 'AI analysis running...' });
        },
        onError: (error) => {
            toast({ title: 'Module unavailable', description: error.message, variant: 'destructive' });
        },
    });

    // ── Boost module (spend extra coinz) ──

    const boostModuleMutation = useMutation({
        mutationFn: async (moduleId: CareerModuleId) => {
            const mod = CAREER_MODULES[moduleId];
            if (!canUseModule(moduleId)) throw new Error('Module not unlocked');
            if (mod.boostCost <= 0) throw new Error('No boost available');
            if (!canAfford(mod.boostCost)) throw new Error(`Need ${mod.boostCost} coinz to boost`);

            await spendCoinz({
                amount: mod.boostCost,
                source: 'career_boost',
                description: `Boosted ${mod.name}: ${mod.boostDescription}`,
                referenceType: 'career_boost',
                referenceId: moduleId,
            });

            return { moduleId, name: mod.name, boostDescription: mod.boostDescription };
        },
        onSuccess: ({ name, boostDescription }) => {
            toast({ title: `⚡ ${name} BOOSTED!`, description: boostDescription });
        },
    });

    // ── Generate AI advice ──────────

    const generateAdvice = (): AIAdvice[] => {
        const advice: AIAdvice[] = [];

        if (metrics.uploads === 0) {
            advice.push({ category: 'release', priority: 'critical', title: 'Upload Your First Track', description: 'Your career starts with your first upload. Get your music on the platform!', action: 'Go to Studio', moduleId: 'career_pulse' });
        }

        if (metrics.uploads > 0 && metrics.sales === 0) {
            advice.push({ category: 'revenue', priority: 'high', title: 'Open Your Storefront', description: 'You have music but no store. Set up your storefront to start earning.', action: 'Set Up Store' });
        }

        if (metrics.healthScore < 40) {
            advice.push({ category: 'general', priority: 'high', title: 'Career Health is Low', description: 'Your career health score is below 40. Focus on consistency and releasing new content.', moduleId: 'career_pulse' });
        }

        if (metrics.uploads >= 3 && metrics.collabs === 0) {
            advice.push({ category: 'growth', priority: 'medium', title: 'Try Collaborating', description: 'You\'ve uploaded tracks but haven\'t collaborated yet. Collabs expose you to new audiences.', moduleId: 'growth_engine' });
        }

        if (metrics.sales >= 5 && !canUseModule('revenue_optimizer')) {
            advice.push({ category: 'revenue', priority: 'medium', title: 'Revenue Optimizer Almost Unlocked', description: 'Keep selling to unlock AI-powered pricing and revenue forecasting.', moduleId: 'revenue_optimizer' });
        }

        if (metrics.streams > 100 && metrics.revenue < 50) {
            advice.push({ category: 'revenue', priority: 'high', title: 'Monetize Your Streams', description: 'You have listeners but low revenue. Consider merch drops or exclusive content.', action: 'Create a Drop' });
        }

        return advice;
    };

    // ── State ──────────────────────

    const careerState: CareerState = {
        currentTier,
        nextTier,
        tierProgress: getTierProgress(),
        unlockedModules,
        lockedModules: getLockedModules(),
        metrics,
        recentAdvice: generateAdvice(),
        milestonesEarned: milestonesQuery.data || [],
        milestonesAvailable: CAREER_MILESTONES,
    };

    return {
        ...careerState,
        isLoading: metricsQuery.isLoading,
        canUseModule,
        useModule: useModuleMutation.mutateAsync,
        isUsingModule: useModuleMutation.isPending,
        boostModule: boostModuleMutation.mutateAsync,
        isBoosting: boostModuleMutation.isPending,
        canAffordModule: (moduleId: CareerModuleId) => canAfford(CAREER_MODULES[moduleId].coinzPerUse),
        canAffordBoost: (moduleId: CareerModuleId) => canAfford(CAREER_MODULES[moduleId].boostCost),
        tierConfig: CAREER_TIERS[currentTier],
        nextTierConfig: nextTier ? CAREER_TIERS[nextTier] : null,
    };
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function defaultMetrics(): CareerMetrics {
    return {
        uploads: 0, sales: 0, streams: 0, collabs: 0,
        revenue: 0, coinz_earned: 0, community_contribution: 0,
        health: { release_cadence: 0, revenue_trend: 0, audience_growth: 0, engagement: 0, consistency: 0 },
        healthScore: 0,
    };
}

function getMetricValue(metric: string, metrics: CareerMetrics): number {
    switch (metric) {
        case 'uploads': return metrics.uploads;
        case 'sales': return metrics.sales;
        case 'streams': return metrics.streams;
        case 'collabs': return metrics.collabs;
        case 'revenue': return metrics.revenue;
        case 'coinz_earned': return metrics.coinz_earned;
        case 'community_contribution': return metrics.community_contribution;
        default: return 0;
    }
}

function calculateHealth(data: { uploads: number; sales: number; streams: number; revenue: number }): Record<HealthMetric, number> {
    return {
        release_cadence: Math.min(100, data.uploads * 15),
        revenue_trend: Math.min(100, data.revenue > 0 ? 40 + Math.min(60, data.revenue / 50) : 0),
        audience_growth: Math.min(100, data.streams > 0 ? 30 + Math.min(70, data.streams / 20) : 0),
        engagement: Math.min(100, (data.sales > 0 ? 40 : 0) + Math.min(60, data.streams / 15)),
        consistency: Math.min(100, data.uploads > 0 ? 50 + Math.min(50, data.uploads * 8) : 0),
    };
}

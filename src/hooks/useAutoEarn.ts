/**
 * useAutoEarn — The engine that makes every interaction mint coinz.
 * 
 * Call `earn(action, opts)` from any component. The engine handles:
 * - Rate lookup from EarnRateConfig
 * - Daily cap enforcement (stored in localStorage with date key)
 * - Fan coinz minting via useMixxWallet
 * - Creator payout routing
 * - Streak multiplier application
 * - CoinzToast notification
 */

import { useCallback, useRef } from 'react';
import { useMixxWallet } from './useMixxWallet';
import { useFanStats, getStreakMultiplier } from './useFanStats';
import { useAuth } from './useAuth';
import { EARN_ACTIONS, type EarnAction } from './EarnRateConfig';
import { supabase } from '@/integrations/supabase/client';

interface EarnOptions {
    /** ID of the content's creator (for creator payouts) */
    creatorId?: string;
    /** Reference ID (track ID, beat ID, etc.) */
    referenceId?: string;
    /** Override description */
    description?: string;
    /** Suppress toast notification */
    silent?: boolean;
}

/** Local storage key for daily caps */
const DAILY_CAP_KEY = 'mixx_daily_caps';

function getDailyCaps(): Record<string, number> {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const stored = localStorage.getItem(DAILY_CAP_KEY);
        if (!stored) return {};
        const parsed = JSON.parse(stored);
        // Reset if different day
        if (parsed._date !== today) return {};
        return parsed;
    } catch {
        return {};
    }
}

function incrementDailyCap(action: string): number {
    const today = new Date().toISOString().slice(0, 10);
    const caps = getDailyCaps();
    caps._date = today;
    const current = (caps[action] || 0) + 1;
    caps[action] = current;
    localStorage.setItem(DAILY_CAP_KEY, JSON.stringify(caps));
    return current;
}

function getDailyCount(action: string): number {
    const caps = getDailyCaps();
    return caps[action] || 0;
}

export function useAutoEarn() {
    const { user } = useAuth();
    const { earnCoinz } = useMixxWallet();
    const { stats } = useFanStats();
    const earningRef = useRef<Set<string>>(new Set());

    /**
     * Earn coinz for an action. Automatically handles:
     * - Rate lookup, daily caps, streak multiplier
     * - Creator payout (if action has one and creatorId provided)
     * - Dedup (won't double-fire for same action+referenceId in same render cycle)
     */
    const earn = useCallback(async (
        actionKey: string,
        options: EarnOptions = {},
    ): Promise<{ earned: number; capped: boolean } | null> => {
        if (!user?.id) return null;

        const action = EARN_ACTIONS[actionKey];
        if (!action) {
            console.warn(`[AutoEarn] Unknown action: ${actionKey}`);
            return null;
        }

        // Dedup key to prevent rapid double-fires
        const dedupKey = `${actionKey}:${options.referenceId || 'none'}`;
        if (earningRef.current.has(dedupKey)) return null;
        earningRef.current.add(dedupKey);
        // Clear dedup after 2 seconds
        setTimeout(() => earningRef.current.delete(dedupKey), 2000);

        // Check daily cap
        const dailyCount = getDailyCount(actionKey);
        if (action.dailyCap > 0 && dailyCount >= action.dailyCap) {
            return { earned: 0, capped: true };
        }

        // Apply streak multiplier
        const streak = stats?.engagement_streak || 0;
        const multiplier = getStreakMultiplier(streak);
        const baseReward = action.coinzPerAction;
        const finalReward = Math.round(baseReward * multiplier);

        try {
            // 1. Award fan coinz
            await earnCoinz({
                amount: finalReward,
                source: action.source,
                description: options.description || `${action.label}${multiplier > 1 ? ` (${multiplier}x streak)` : ''}`,
                referenceType: actionKey,
                referenceId: options.referenceId,
            });

            // 2. Creator payout (if applicable)
            if (action.creatorPayout && options.creatorId && options.creatorId !== user.id) {
                const creatorReward = action.creatorCoinz;
                if (creatorReward > 0) {
                    // Atomic RPC — no more stale-read-then-write on creator wallet
                    await supabase.rpc('earn_coinz', {
                        p_user_id: options.creatorId,
                        p_amount: creatorReward,
                        p_source: 'creator_payout',
                        p_description: `Fan ${action.label.toLowerCase()} your content`,
                        p_reference_type: actionKey,
                        p_reference_id: options.referenceId || null,
                    });
                    // Errors silently ignored — creator payout is best-effort
                }
            }

            // 3. Increment daily cap
            incrementDailyCap(actionKey);

            return { earned: finalReward, capped: false };
        } catch (error) {
            console.error(`[AutoEarn] Failed for ${actionKey}:`, error);
            return null;
        }
    }, [user?.id, stats?.engagement_streak, earnCoinz]);

    /** Check if an action is still earnable today */
    const canEarn = useCallback((actionKey: string): boolean => {
        const action = EARN_ACTIONS[actionKey];
        if (!action) return false;
        if (action.dailyCap <= 0) return true;
        return getDailyCount(actionKey) < action.dailyCap;
    }, []);

    /** Get remaining earns for an action today */
    const remainingToday = useCallback((actionKey: string): number => {
        const action = EARN_ACTIONS[actionKey];
        if (!action) return 0;
        if (action.dailyCap <= 0) return Infinity;
        return Math.max(0, action.dailyCap - getDailyCount(actionKey));
    }, []);

    /** Get today's total earned across all actions */
    const getTodayTotal = useCallback((): number => {
        const caps = getDailyCaps();
        let total = 0;
        for (const [key, count] of Object.entries(caps)) {
            if (key === '_date') continue;
            const action = EARN_ACTIONS[key];
            if (action) {
                total += action.coinzPerAction * (count as number);
            }
        }
        return total;
    }, []);

    return {
        earn,
        canEarn,
        remainingToday,
        getTodayTotal,
        actions: EARN_ACTIONS,
    };
}

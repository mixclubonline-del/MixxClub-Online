/**
 * useMutationThrottle — Client-side rate limiting for critical mutations.
 * 
 * Prevents rapid-fire abuse on:
 * - Coinz gifting, spending, earning
 * - Ticket purchases, merch orders
 * - Campaign creation, module boosts
 * 
 * Uses a token bucket algorithm with configurable:
 * - maxBurst: max actions in a burst
 * - refillRate: tokens restored per second
 * - cooldownMs: forced delay after burst exhaustion
 * 
 * Server-side atomic RPCs are the real protection.
 * This layer prevents unnecessary network requests.
 */

import { useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ThrottleConfig {
    /** Max actions before throttle kicks in */
    maxBurst: number;
    /** Tokens refilled per second */
    refillRate: number;
    /** Cooldown in ms after burst exhaustion */
    cooldownMs: number;
    /** User-facing label for the action being throttled */
    actionLabel?: string;
}

interface ThrottleState {
    tokens: number;
    lastRefill: number;
    cooldownUntil: number;
}

// Preset configs for common actions
export const THROTTLE_PRESETS = {
    /** Coinz spending: 3 per 5 seconds */
    coinzSpend: { maxBurst: 3, refillRate: 0.6, cooldownMs: 5000, actionLabel: 'Spending coinz' } as ThrottleConfig,
    /** Coinz gifting: 2 per 10 seconds */
    coinzGift: { maxBurst: 2, refillRate: 0.2, cooldownMs: 10000, actionLabel: 'Gifting coinz' } as ThrottleConfig,
    /** Purchases: 2 per 5 seconds */
    purchase: { maxBurst: 2, refillRate: 0.4, cooldownMs: 5000, actionLabel: 'Purchasing' } as ThrottleConfig,
    /** Campaign creation: 1 per 10 seconds */
    campaignCreate: { maxBurst: 1, refillRate: 0.1, cooldownMs: 10000, actionLabel: 'Creating campaigns' } as ThrottleConfig,
    /** Module boost: 1 per 15 seconds */
    moduleBoost: { maxBurst: 1, refillRate: 0.067, cooldownMs: 15000, actionLabel: 'Boosting' } as ThrottleConfig,
    /** General action: 5 per 3 seconds */
    general: { maxBurst: 5, refillRate: 1.67, cooldownMs: 3000, actionLabel: 'Action' } as ThrottleConfig,
} as const;

/**
 * Hook that wraps any async mutation with client-side rate limiting.
 * 
 * @example
 * const { throttled, isThrottled } = useMutationThrottle(THROTTLE_PRESETS.coinzSpend);
 * const handleSpend = throttled(async () => { await spendCoinz({...}) });
 */
export function useMutationThrottle(config: ThrottleConfig) {
    const { toast } = useToast();
    const stateRef = useRef<ThrottleState>({
        tokens: config.maxBurst,
        lastRefill: Date.now(),
        cooldownUntil: 0,
    });

    const refillTokens = useCallback(() => {
        const now = Date.now();
        const state = stateRef.current;
        const elapsed = (now - state.lastRefill) / 1000; // seconds
        const newTokens = Math.min(config.maxBurst, state.tokens + elapsed * config.refillRate);
        state.tokens = newTokens;
        state.lastRefill = now;
    }, [config.maxBurst, config.refillRate]);

    const isThrottled = useCallback((): boolean => {
        const now = Date.now();
        if (now < stateRef.current.cooldownUntil) return true;
        refillTokens();
        return stateRef.current.tokens < 1;
    }, [refillTokens]);

    const throttled = useCallback(<T,>(fn: () => Promise<T>): (() => Promise<T | null>) => {
        return async () => {
            const now = Date.now();
            const state = stateRef.current;

            // Check cooldown
            if (now < state.cooldownUntil) {
                const remaining = Math.ceil((state.cooldownUntil - now) / 1000);
                toast({
                    title: '⏳ Slow down',
                    description: `${config.actionLabel || 'Action'} is rate-limited. Try again in ${remaining}s.`,
                    variant: 'destructive',
                });
                return null;
            }

            // Refill tokens
            refillTokens();

            // Check tokens
            if (state.tokens < 1) {
                state.cooldownUntil = now + config.cooldownMs;
                const cooldownSec = Math.ceil(config.cooldownMs / 1000);
                toast({
                    title: '⏳ Slow down',
                    description: `Too many rapid ${(config.actionLabel || 'actions').toLowerCase()}. Cooling down for ${cooldownSec}s.`,
                    variant: 'destructive',
                });
                return null;
            }

            // Consume token and execute
            state.tokens -= 1;
            return fn();
        };
    }, [config, refillTokens, toast]);

    const getRemainingCooldown = useCallback((): number => {
        const now = Date.now();
        return Math.max(0, stateRef.current.cooldownUntil - now);
    }, []);

    return {
        /** Wrap an async function with throttle protection */
        throttled,
        /** Check if currently throttled (without triggering toast) */
        isThrottled,
        /** Get remaining cooldown in ms */
        getRemainingCooldown,
    };
}

/**
 * Simple debounce for mutation buttons.
 * Prevents double-click issues without full token bucket.
 */
export function useMutationDebounce(delayMs = 1000) {
    const lastCallRef = useRef(0);

    const debounced = useCallback(<T,>(fn: () => Promise<T>): (() => Promise<T | null>) => {
        return async () => {
            const now = Date.now();
            if (now - lastCallRef.current < delayMs) return null;
            lastCallRef.current = now;
            return fn();
        };
    }, [delayMs]);

    return { debounced };
}

/**
 * useRobustMutation — Standardized error handling + retry for critical mutations.
 * 
 * Wraps React Query mutations with:
 * - User-facing error messages that explain what went wrong
 * - Automatic retry with exponential backoff for network errors
 * - Distinguishes recoverable vs non-recoverable errors
 * - Optional throttle integration
 * 
 * Use this for any mutation that involves money, transactions, or purchases.
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useRef } from 'react';

interface RobustMutationConfig<TData, TVariables> {
    /** The mutation function */
    mutationFn: (vars: TVariables) => Promise<TData>;
    /** User-facing action name (e.g. "Purchase ticket", "Send gift") */
    actionName: string;
    /** Success toast config */
    onSuccessToast?: {
        title: string;
        description?: string | ((data: TData) => string);
    };
    /** Called on success (after toast) */
    onSuccess?: (data: TData) => void;
    /** Called on error (after toast) */
    onError?: (error: Error) => void;
    /** Max retries for network errors (default: 1) */
    maxRetries?: number;
    /** Minimum ms between calls (simple debounce, default: 1000) */
    debounceMs?: number;
}

/** Classify errors into user-friendly categories */
function classifyError(error: unknown): {
    title: string;
    description: string;
    isRecoverable: boolean;
} {
    const msg = error instanceof Error ? error.message : String(error);
    const lowerMsg = msg.toLowerCase();

    // Insufficient balance
    if (lowerMsg.includes('insufficient') || lowerMsg.includes('balance')) {
        return {
            title: '💰 Insufficient Balance',
            description: 'You don\'t have enough MixxCoinz for this action. Earn more by engaging with content!',
            isRecoverable: false,
        };
    }

    // Not authenticated
    if (lowerMsg.includes('authenticated') || lowerMsg.includes('auth') || lowerMsg.includes('login')) {
        return {
            title: '🔐 Login Required',
            description: 'Please sign in to continue. Your progress has been saved.',
            isRecoverable: false,
        };
    }

    // Network / timeout errors
    if (lowerMsg.includes('fetch') || lowerMsg.includes('network') || lowerMsg.includes('timeout') || lowerMsg.includes('econnrefused')) {
        return {
            title: '📡 Connection Issue',
            description: 'Check your internet connection and try again. Don\'t worry — no coinz were spent.',
            isRecoverable: true,
        };
    }

    // Rate limited (from our Postgres functions)
    if (lowerMsg.includes('rate') || lowerMsg.includes('too many') || lowerMsg.includes('slow down')) {
        return {
            title: '⏳ Too Fast',
            description: 'You\'re moving too quickly. Wait a moment and try again.',
            isRecoverable: true,
        };
    }

    // Duplicate / already exists
    if (lowerMsg.includes('duplicate') || lowerMsg.includes('already') || lowerMsg.includes('conflict')) {
        return {
            title: '⚠️ Already Done',
            description: 'This action has already been completed.',
            isRecoverable: false,
        };
    }

    // Permission errors
    if (lowerMsg.includes('permission') || lowerMsg.includes('denied') || lowerMsg.includes('forbidden') || lowerMsg.includes('policy')) {
        return {
            title: '🚫 Not Allowed',
            description: 'You don\'t have permission for this action. Check your account level.',
            isRecoverable: false,
        };
    }

    // Wallet not found
    if (lowerMsg.includes('wallet not found') || lowerMsg.includes('no wallet')) {
        return {
            title: '💰 Wallet Issue',
            description: 'There was a problem with your wallet. Try refreshing the page.',
            isRecoverable: true,
        };
    }

    // Generic / unknown
    return {
        title: '❌ Something Went Wrong',
        description: `${msg.slice(0, 100)}. If this keeps happening, try refreshing.`,
        isRecoverable: true,
    };
}

export function useRobustMutation<TData = unknown, TVariables = void>(
    config: RobustMutationConfig<TData, TVariables>
) {
    const { toast } = useToast();
    const lastCallRef = useRef(0);
    const debounceMs = config.debounceMs ?? 1000;

    const wrappedMutationFn = useCallback(async (vars: TVariables): Promise<TData> => {
        // Simple debounce
        const now = Date.now();
        if (now - lastCallRef.current < debounceMs) {
            throw new Error('Please wait before trying again');
        }
        lastCallRef.current = now;

        // Retry logic for network errors
        const maxRetries = config.maxRetries ?? 1;
        let lastError: unknown;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await config.mutationFn(vars);
            } catch (error) {
                lastError = error;
                const classified = classifyError(error);

                // Only retry recoverable errors
                if (!classified.isRecoverable || attempt >= maxRetries) {
                    throw error;
                }

                // Exponential backoff: 500ms, 1000ms, 2000ms...
                const backoff = Math.min(500 * Math.pow(2, attempt), 4000);
                await new Promise(resolve => setTimeout(resolve, backoff));
            }
        }

        throw lastError;
    }, [config, debounceMs]);

    const mutation = useMutation({
        mutationFn: wrappedMutationFn,
        onSuccess: (data) => {
            if (config.onSuccessToast) {
                const desc = typeof config.onSuccessToast.description === 'function'
                    ? config.onSuccessToast.description(data)
                    : config.onSuccessToast.description;

                toast({
                    title: config.onSuccessToast.title,
                    description: desc,
                });
            }
            config.onSuccess?.(data);
        },
        onError: (error) => {
            const classified = classifyError(error);
            toast({
                title: classified.title,
                description: classified.description,
                variant: 'destructive',
            });
            config.onError?.(error as Error);
        },
    });

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    };
}

/** Export the classifier for use in custom error handling */
export { classifyError };

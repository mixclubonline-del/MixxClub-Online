/**
 * Generic async hook for API calls with loading/error states
 * Useful for wrapping any async operation
 */

import { useEffect, useState } from 'react';

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate = true
) {
    const [status, setStatus] = useState<AsyncStatus>('idle');
    const [value, setValue] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const execute = async () => {
        setStatus('pending');
        setValue(null);
        setError(null);

        try {
            const response = await asyncFunction();
            setValue(response);
            setStatus('success');
            return response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setStatus('error');
            throw error;
        }
    };

    useEffect(() => {
        if (immediate) {
            execute().catch(() => {
                // Error is already handled in state
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [immediate]);

    const reset = () => {
        setStatus('idle');
        setValue(null);
        setError(null);
    };

    return { execute, status, value, error, reset };
}

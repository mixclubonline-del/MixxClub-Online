/**
 * Cross-browser UUID generator
 * 
 * Uses crypto.randomUUID() when available (modern secure contexts),
 * falls back to Math.random-based v4 UUID for older browsers
 * (Safari < 15.4, non-HTTPS contexts).
 */
export const uuid = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });

/**
 * WaitlistGate — Pre-launch content gating wrapper
 *
 * Checks if the platform is in pre_launch mode.
 * If so, renders WaitlistCapture instead of children.
 * When the admin flips to "live", children render normally.
 */

import { type ReactNode } from 'react';
import { useIsPreLaunch } from '@/hooks/usePlatformConfig';
import { WaitlistCapture } from '@/components/waitlist/WaitlistCapture';

interface WaitlistGateProps {
    children: ReactNode;
    /** If true, always show the WaitlistCapture regardless of launch mode (for /request-access route) */
    forceCapture?: boolean;
}

export function WaitlistGate({ children, forceCapture }: WaitlistGateProps) {
    const isPreLaunch = useIsPreLaunch();

    if (forceCapture || isPreLaunch) {
        return (
            <div className="min-h-[100svh] bg-background flex items-center justify-center px-4 py-12">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-950/20" />
                <div className="relative z-10 w-full">
                    <WaitlistCapture />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

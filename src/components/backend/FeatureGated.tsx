/**
 * Feature Gated Component
 * Wraps components that require specific subscription tiers
 * Shows upsell message if feature is not available
 */

import React, { useEffect, useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useBackendSubscription } from '@/hooks/useBackendSubscription';

interface FeatureGatedProps {
    feature: string;
    userId: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requiredTier?: 'starter' | 'pro' | 'studio';
}

export const FeatureGated: React.FC<FeatureGatedProps> = ({
    feature,
    userId,
    children,
    fallback,
    requiredTier,
}) => {
    const { subscription } = useBackendSubscription(userId);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const { hasFeature } = useBackendSubscription(userId);

    useEffect(() => {
        async function checkAccess() {
            try {
                setLoading(true);
                const access = await hasFeature(feature);
                setHasAccess(access);
            } finally {
                setLoading(false);
            }
        }

        checkAccess();
    }, [userId, feature, hasFeature]);

    if (loading) {
        return <div className="p-6 bg-gray-50 rounded-lg animate-pulse h-20"></div>;
    }

    if (!hasAccess) {
        return (
            fallback || (
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 shadow-md">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <Lock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Premium Feature Locked</h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Upgrade to {requiredTier ? `${requiredTier.toUpperCase()}` : 'a higher tier'} to access {feature.replace(/_/g, ' ')}.
                            </p>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                                Upgrade Now
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )
        );
    }

    return <>{children}</>;
};

export default FeatureGated;

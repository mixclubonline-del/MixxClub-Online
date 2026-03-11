/**
 * Feature Gated Component
 * Wraps components that require specific subscription tiers OR community unlock progress.
 * Shows upsell message or community progress if feature is not available.
 */

import React, { useEffect, useState } from 'react';
import { Lock, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBackendSubscription } from '@/hooks/useBackendSubscription';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';
import { Progress } from '@/components/ui/progress';

interface FeatureGatedProps {
    feature: string;
    userId: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requiredTier?: 'starter' | 'pro' | 'studio';
    /** If true, checks community unlock status instead of subscription */
    communityGated?: boolean;
    /** The milestone feature_key (metric_type) to check for community unlocks */
    communityMilestoneKey?: string;
}

export const FeatureGated: React.FC<FeatureGatedProps> = ({
    feature,
    userId,
    children,
    fallback,
    requiredTier,
    communityGated = false,
    communityMilestoneKey,
}) => {
    const navigate = useNavigate();
    const { subscription } = useBackendSubscription(userId);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const { hasFeature } = useBackendSubscription(userId);
    const { data: milestones, isLoading: milestonesLoading } = useCommunityMilestones();

    // Find the relevant community milestone by feature_key (derived from metric_type)
    const communityMilestone = communityGated && communityMilestoneKey
        ? milestones.find((m) => m.feature_key === communityMilestoneKey)
        : null;

    useEffect(() => {
        async function checkAccess() {
            try {
                setLoading(true);
                
                // If community gated, check milestone status
                if (communityGated && communityMilestone) {
                    setHasAccess(communityMilestone.is_unlocked);
                } else {
                    // Otherwise check subscription
                    const access = await hasFeature(feature);
                    setHasAccess(access);
                }
            } finally {
                setLoading(false);
            }
        }

        if (!milestonesLoading) {
            checkAccess();
        }
    }, [userId, feature, hasFeature, communityGated, communityMilestone, milestonesLoading]);

    if (loading || milestonesLoading) {
        return <div className="p-6 bg-muted/50 rounded-lg animate-pulse h-20"></div>;
    }

    if (!hasAccess) {
        // Community gated fallback - show progress
        if (communityGated && communityMilestone) {
            return (
                fallback || (
                    <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border-2 border-primary/20 shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-2">Community Unlock</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    This feature unlocks at {communityMilestone.target_value} members. 
                                    We're currently at {communityMilestone.current_value}.
                                </p>
                                <Progress value={communityMilestone.progress_percentage} className="h-2 mb-2" />
                                <p className="text-xs text-primary">
                                    {communityMilestone.target_value - communityMilestone.current_value} more members needed to unlock {feature.replace(/_/g, ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            );
        }

        // Subscription gated fallback
        return (
            fallback || (
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border-2 border-amber-200 dark:border-amber-800 shadow-md">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">Premium Feature Locked</h3>
                            <p className="text-sm text-muted-foreground mb-4">
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

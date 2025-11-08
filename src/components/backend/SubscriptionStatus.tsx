/**
 * Subscription Status Component
 * Displays user's current subscription tier and usage
 */

import React from 'react';
import { useBackendSubscription } from '@/hooks/useBackendSubscription';

interface SubscriptionStatusProps {
    userId: string;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ userId }) => {
    const { subscription, loading, error } = useBackendSubscription(userId);

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-red-600 font-semibold">Error loading subscription</p>
                <p className="text-red-500 text-sm">{error.message}</p>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <p className="font-semibold">No subscription found</p>
            </div>
        );
    }

    const usagePercent = ((subscription.usage_current || 0) / (subscription.usage_limit || 1)) * 100;

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 capitalize">{subscription.tier} Plan</h2>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-700">Status:</span>
                    <span className="font-semibold capitalize text-blue-600">{subscription.status}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-700">Monthly Cost:</span>
                    <span className="font-semibold">${subscription.price_monthly || 0}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-700">Usage:</span>
                    <span className="font-semibold">
                        {subscription.usage_current} / {subscription.usage_limit}
                    </span>
                </div>
                <div className="mt-4">
                    <div className="bg-white rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{Math.round(usagePercent)}% used</p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionStatus;

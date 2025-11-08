/**
 * Analytics Dashboard Component
 * Displays subscription, matching, and marketplace analytics
 */

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { SubscriptionService } from '@/services/subscriptionService';
import { MatchingEngineService } from '@/services/matchingEngineService';
import { MarketplaceService } from '@/services/marketplaceService';

interface AnalyticStats {
    subscriptionStats: {
        total_subscribers?: number;
        monthly_revenue?: number;
        churn_rate?: number;
    } | null;
    matchingStats: {
        total_matches?: number;
        match_success_rate?: number;
        avg_match_quality?: number;
    } | null;
    sellerStats: {
        total_sales?: number;
        total_earnings?: number;
        total_products?: number;
    } | null;
}

interface AnalyticsDashboardProps {
    userId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
    const [analytics, setAnalytics] = useState<AnalyticStats>({
        subscriptionStats: null,
        matchingStats: null,
        sellerStats: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadAnalytics() {
            try {
                setLoading(true);
                const [subStats, matchStats, sellerStats] = await Promise.all([
                    SubscriptionService.getSubscriptionAnalytics(),
                    MatchingEngineService.getMatchingAnalytics(),
                    MarketplaceService.getSellerAnalytics(userId),
                ]);

                setAnalytics({
                    subscriptionStats: subStats,
                    matchingStats: matchStats,
                    sellerStats: sellerStats,
                });
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        }

        loadAnalytics();
    }, [userId]);

    if (loading) {
        return <div className="p-6 bg-gray-50 rounded-lg animate-pulse h-96"></div>;
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-red-600 font-semibold">Failed to load analytics</p>
                <p className="text-red-500 text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Subscription Analytics Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-blue-500" />
                        <h3 className="text-lg font-bold">Subscriptions</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Subscribers:</span>
                            <span className="font-semibold">
                                {analytics.subscriptionStats?.total_subscribers || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Revenue:</span>
                            <span className="font-semibold">
                                ${analytics.subscriptionStats?.monthly_revenue || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Churn Rate:</span>
                            <span className="font-semibold">
                                {analytics.subscriptionStats?.churn_rate || 0}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Matching Analytics Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-purple-500" />
                        <h3 className="text-lg font-bold">Matching</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Matches:</span>
                            <span className="font-semibold">
                                {analytics.matchingStats?.total_matches || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Success Rate:</span>
                            <span className="font-semibold">
                                {analytics.matchingStats?.match_success_rate || 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Avg Quality:</span>
                            <span className="font-semibold">
                                {analytics.matchingStats?.avg_match_quality || 0}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Marketplace Analytics Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center gap-3 mb-4">
                        <ShoppingCart className="w-6 h-6 text-green-500" />
                        <h3 className="text-lg font-bold">Marketplace</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Sales:</span>
                            <span className="font-semibold">
                                {analytics.sellerStats?.total_sales || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Earnings:</span>
                            <span className="font-semibold">
                                ${analytics.sellerStats?.total_earnings || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Products:</span>
                            <span className="font-semibold">
                                {analytics.sellerStats?.total_products || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                        { name: 'Subscriptions', value: analytics.subscriptionStats?.monthly_revenue || 0 },
                        { name: 'Marketplace', value: analytics.sellerStats?.total_earnings || 0 },
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    DollarSign, TrendingUp, Users, ShoppingCart, BookOpen,
    Handshake, ArrowUpRight, Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RevenueHubProps {
    userType?: 'artist' | 'engineer';
    userId?: string;
}

export const RevenueHub: React.FC<RevenueHubProps> = ({ userType, userId }) => {
    const { user } = useAuth();
    const [revenueData, setRevenueData] = useState({
        totalMonthly: 2347,
        subscription: 0,
        referral: 250,
        marketplace: 892,
        services: 900,
        courses: 150,
        partners: 155,
    });

    const revenueStreams = [
        {
            label: 'Subscription',
            value: revenueData.subscription,
            system: '#1',
            color: 'bg-blue-500',
            icon: <Badge className="bg-blue-600" />,
            description: 'Pro tier ($30/month)',
            action: 'Manage Subscription',
        },
        {
            label: 'Referral Bonuses',
            value: revenueData.referral,
            system: '#2',
            color: 'bg-green-500',
            icon: <Users className="w-4 h-4" />,
            description: '12 active referrals',
            action: 'Share Code',
        },
        {
            label: 'Marketplace Sales',
            value: revenueData.marketplace,
            system: '#6',
            color: 'bg-purple-500',
            icon: <ShoppingCart className="w-4 h-4" />,
            description: '45 tracks sold (70% share)',
            action: 'Manage Store',
        },
        {
            label: 'Services Revenue',
            value: revenueData.services,
            system: '#8',
            color: 'bg-orange-500',
            icon: <TrendingUp className="w-4 h-4" />,
            description: 'Professional services',
            action: 'View Services',
        },
        {
            label: 'Course Sales',
            value: revenueData.courses,
            system: '#9',
            color: 'bg-pink-500',
            icon: <BookOpen className="w-4 h-4" />,
            description: '23 enrolled students',
            action: 'Manage Courses',
        },
        {
            label: 'Partner Commissions',
            value: revenueData.partners,
            system: '#10',
            color: 'bg-indigo-500',
            icon: <Handshake className="w-4 h-4" />,
            description: '15% commission rate',
            action: 'Partner Dashboard',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Revenue Dashboard</h2>
                    <p className="text-slate-400 mt-1">Track all your income streams</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Total Revenue Card */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-slate-400 mb-2">This Month Revenue</p>
                        <h3 className="text-5xl font-bold text-white mb-4">
                            ${revenueData.totalMonthly.toLocaleString()}
                        </h3>
                        <div className="flex items-center gap-2 text-green-400">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+12.5% from last month</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 mb-2">Yearly Potential</p>
                        <p className="text-3xl font-bold text-white">
                            ${(revenueData.totalMonthly * 12).toLocaleString()}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Revenue Streams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {revenueStreams.map((stream, idx) => (
                    <Card key={idx} className="bg-slate-800 border-slate-700 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${stream.color} flex items-center justify-center text-white`}>
                                    {typeof stream.icon === 'string' ? (
                                        <span>{stream.icon}</span>
                                    ) : (
                                        <DollarSign className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{stream.label}</h4>
                                    <p className="text-xs text-slate-400">System {stream.system}</p>
                                </div>
                            </div>
                            <Badge variant="outline">${stream.value}</Badge>
                        </div>

                        <p className="text-sm text-slate-300 mb-4">{stream.description}</p>
                        <Progress value={(stream.value / revenueData.totalMonthly) * 100} className="mb-4" />
                        <Button variant="outline" size="sm" className="w-full">
                            {stream.action}
                        </Button>
                    </Card>
                ))}
            </div>

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Details */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Subscription Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Current Plan</span>
                            <Badge>Pro ($30/mo)</Badge>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Next Billing</span>
                            <span className="text-white">Nov 30, 2025</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Features Unlocked</span>
                            <span className="text-white">8/10</span>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            Upgrade to Studio ($100/mo)
                        </Button>
                    </div>
                </Card>

                {/* Referral Details */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Referral Program</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Your Code</span>
                            <Badge variant="secondary">ARTIST-KJ9B2F</Badge>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Active Referrals</span>
                            <span className="text-white">12 users</span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Conversion Rate</span>
                            <span className="text-green-400">25.5%</span>
                        </div>
                        <Button className="w-full mt-4" variant="default">
                            Share & Earn
                        </Button>
                    </div>
                </Card>

                {/* Marketplace Details */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Marketplace Analytics</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Total Sales</span>
                            <span className="text-white">45 tracks</span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Your Revenue (70%)</span>
                            <span className="text-white">$892</span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Top Track</span>
                            <span className="text-white">"Summer Vibes"</span>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            Manage Marketplace
                        </Button>
                    </div>
                </Card>

                {/* Partner Details */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Partner Program</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Status</span>
                            <Badge className="bg-green-600">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">Commission Rate</span>
                            <span className="text-white">15%</span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                            <span className="text-slate-300">This Month</span>
                            <span className="text-white">$155</span>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            Partner Dashboard
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Upcoming Features */}
            <Card className="bg-slate-800 border-slate-700 p-6 border-2 border-dashed">
                <h3 className="text-lg font-semibold text-white mb-4">🚀 Coming Soon</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-2xl mb-2">💳</p>
                        <p className="text-sm text-slate-300">Direct Payouts</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl mb-2">📊</p>
                        <p className="text-sm text-slate-300">Advanced Analytics</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl mb-2">🎁</p>
                        <p className="text-sm text-slate-300">Bonus Programs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl mb-2">🏆</p>
                        <p className="text-sm text-slate-300">Achievement Rewards</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RevenueHub;

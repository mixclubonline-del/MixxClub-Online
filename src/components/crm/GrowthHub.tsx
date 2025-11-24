import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Rocket, Award, TrendingUp, Zap, Users, Briefcase,
    ArrowRight, Lock, ChevronRight, Target, Star, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface GrowthHubProps {
    userType?: 'artist' | 'engineer';
}

export const GrowthHub: React.FC<GrowthHubProps> = ({ userType }) => {
    const { user } = useAuth();
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    const growthOpportunities = [
        {
            id: 'referral',
            title: 'Referral Mastery',
            description: 'Build passive income by referring creators',
            system: '#2',
            earnings: '$250/month',
            status: 'active',
            completionRate: 65,
            nextMilestone: 'Get 20 referrals → Unlock +10% bonus',
            action: 'Optimize Strategy',
            icon: '👥',
        },
        {
            id: 'viral',
            title: 'Viral Growth',
            description: 'Maximize reach through community sharing',
            system: '#4',
            earnings: 'Audience growth',
            status: 'active',
            completionRate: 78,
            nextMilestone: '10K followers → Unlock promotion tools',
            action: 'View Analytics',
            icon: '🔥',
        },
        {
            id: 'partner',
            title: 'Partner Program',
            description: 'Earn commissions from referred services',
            system: '#10',
            earnings: '$155/month',
            status: 'active',
            completionRate: 45,
            nextMilestone: 'Reach 50K generated revenue → +5% commission',
            action: 'Expand Network',
            icon: '🤝',
        },
        {
            id: 'enterprise',
            title: 'Enterprise Solutions',
            description: 'White-label your platform for businesses',
            system: '#11',
            earnings: '$500+/month',
            status: 'unlock-ready',
            completionRate: 100,
            nextMilestone: 'Unlock at Studio tier',
            action: 'Apply Now',
            icon: '🏢',
            badge: 'READY',
        },
    ];

    const milestones = [
        { level: 1, name: 'Starter', followers: 100, referrals: 1, reward: 'Referral badge' },
        { level: 2, name: 'Rising Star', followers: 1000, referrals: 5, reward: '+5% bonus' },
        { level: 3, name: 'Creator', followers: 5000, referrals: 15, reward: 'Feature page' },
        { level: 4, name: 'Pro Creator', followers: 10000, referrals: 30, reward: 'Revenue boost' },
        { level: 5, name: 'Elite', followers: 50000, referrals: 100, reward: 'VIP support' },
    ];

    const upcomingFeatures = [
        {
            name: 'Affiliate Store',
            description: 'Create your own store with 40% commission',
            launchDate: 'Q1 2025',
            icon: '🛍️',
        },
        {
            name: 'Masterclass Revenue',
            description: 'Teach live sessions and earn per attendee',
            launchDate: 'Q2 2025',
            icon: '🎓',
        },
        {
            name: 'Collaboration Bounties',
            description: 'Get paid to collaborate with other creators',
            launchDate: 'Q1 2025',
            icon: '🎯',
        },
        {
            name: 'Brand Partnerships',
            description: 'Connect with brands for sponsorships',
            launchDate: 'Q2 2025',
            icon: '🌟',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold">Growth & Opportunities</h2>
                <p className="text-slate-400 mt-1">Scale your income and impact</p>
            </div>

            {/* Growth Pathways */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {growthOpportunities.map((opp) => (
                    <Card
                        key={opp.id}
                        className={`border cursor-pointer transition ${selectedPath === opp.id
                                ? 'border-blue-500 bg-gradient-to-br from-blue-900 to-slate-800'
                                : opp.status === 'unlock-ready'
                                    ? 'border-yellow-600 bg-gradient-to-br from-yellow-900 to-slate-800'
                                    : 'border-slate-700 bg-slate-800'
                            }`}
                        onClick={() => setSelectedPath(selectedPath === opp.id ? null : opp.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{opp.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">{opp.title}</h3>
                                        <p className="text-xs text-slate-400">System {opp.system}</p>
                                    </div>
                                </div>
                                {opp.badge && <Badge className="bg-yellow-600">{opp.badge}</Badge>}
                            </div>

                            <p className="text-slate-300 text-sm mb-4">{opp.description}</p>

                            <div className="mb-4 pb-4 border-b border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400 text-sm">Progress</span>
                                    <span className="text-white font-bold">{opp.completionRate}%</span>
                                </div>
                                <Progress value={opp.completionRate} />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-slate-400 text-xs">Current Earnings</p>
                                    <p className="text-white font-bold">{opp.earnings}</p>
                                </div>
                                <div className="bg-slate-900 rounded p-3">
                                    <p className="text-xs text-slate-400 mb-1">Next Milestone</p>
                                    <p className="text-sm text-white">{opp.nextMilestone}</p>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-4"
                                variant={selectedPath === opp.id ? 'default' : 'outline'}
                            >
                                {opp.action}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Selected Path Details */}
            {selectedPath === 'referral' && (
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-green-400" />
                        <h3 className="text-xl font-semibold text-white">Referral Mastery Path</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Active Referrals</p>
                            <p className="text-3xl font-bold text-green-400">12</p>
                            <p className="text-xs text-slate-400 mt-1">3 away from next tier</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Monthly Revenue</p>
                            <p className="text-3xl font-bold text-green-400">$250</p>
                            <p className="text-xs text-slate-400 mt-1">+$35 from last month</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Conversion Rate</p>
                            <p className="text-3xl font-bold text-green-400">25.5%</p>
                            <p className="text-xs text-slate-400 mt-1">Industry avg: 18%</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                        <h4 className="font-semibold text-white mb-4">Optimization Tips</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <span className="text-green-400 mt-1">✓</span>
                                <div>
                                    <p className="text-white font-medium">Personalize Your Pitch</p>
                                    <p className="text-sm text-slate-300">Mention specific benefits relevant to each person</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-400 mt-1">✓</span>
                                <div>
                                    <p className="text-white font-medium">Follow Up Strategy</p>
                                    <p className="text-sm text-slate-300">Send reminder after 1 week for 2x conversion</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-400 mt-1">✓</span>
                                <div>
                                    <p className="text-white font-medium">Share Success Stories</p>
                                    <p className="text-sm text-slate-300">Show how others benefit - social proof works</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </Card>
            )}

            {selectedPath === 'enterprise' && (
                <Card className="bg-gradient-to-br from-yellow-900 to-slate-800 border-yellow-600 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-xl font-semibold text-white">Enterprise Solutions - READY TO UNLOCK</h3>
                    </div>

                    <div className="mb-6 p-4 bg-slate-900 rounded-lg border-2 border-yellow-600">
                        <h4 className="text-white font-semibold mb-3">✨ Why Enterprise?</h4>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li>💰 $500-$5,000+ monthly recurring revenue</li>
                            <li>🏢 White-label platform for your brand</li>
                            <li>🔧 Customizable tools for your business clients</li>
                            <li>📊 Full analytics and reporting dashboard</li>
                            <li>🎯 Dedicated enterprise support</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <h4 className="text-white font-semibold mb-3">Requirements</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-slate-300">
                                    <Badge className="bg-green-600">✓</Badge>
                                    Studio Tier ($100/mo)
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <Badge className="bg-green-600">✓</Badge>
                                    2+ Years Platform History
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <Badge className="bg-green-600">✓</Badge>
                                    Active Community (5K+ followers)
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">Your Qualifications</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-slate-300">
                                    <Badge variant="outline">Tier: Studio</Badge>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <Badge variant="outline">Followers: 2.1K</Badge>
                                </li>
                                <li className="flex items-center gap-2 text-yellow-300">
                                    <span className="font-bold">⭐ Ready to Apply!</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
                        <Rocket className="w-4 h-4 mr-2" />
                        Apply for Enterprise Now
                    </Button>
                </Card>
            )}

            {/* Achievement Milestones */}
            <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Achievement Milestones</h3>
                </div>

                <div className="space-y-3">
                    {milestones.map((milestone) => {
                        const isUnlocked = milestone.level <= 2; // Current level: Creator (2)
                        return (
                            <div
                                key={milestone.level}
                                className={`p-4 rounded-lg border flex items-center justify-between ${isUnlocked
                                        ? 'bg-slate-900 border-slate-700'
                                        : 'bg-slate-900 border-slate-700 opacity-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">
                                        {isUnlocked ? '⭐' : '🔒'}
                                    </span>
                                    <div>
                                        <p className="text-white font-semibold">{milestone.name}</p>
                                        <p className="text-sm text-slate-400">
                                            {milestone.followers.toLocaleString()} followers • {milestone.referrals} referrals
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-yellow-400">{milestone.reward}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Upcoming Revenue Features */}
            <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Rocket className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">🚀 Upcoming Revenue Features</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingFeatures.map((feature, idx) => (
                        <div key={idx} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{feature.icon}</span>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white mb-1">{feature.name}</h4>
                                    <p className="text-sm text-slate-300 mb-2">{feature.description}</p>
                                    <Badge variant="outline" className="text-xs">
                                        {feature.launchDate}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Personalized Roadmap */}
            <Card className="bg-gradient-to-br from-blue-900 to-slate-800 border-blue-600 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Your 90-Day Roadmap</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                                ✓
                            </div>
                            <div className="w-1 h-20 bg-slate-600 mt-2"></div>
                        </div>
                        <div className="pb-8">
                            <p className="text-white font-semibold">Week 1-2: Referral Push</p>
                            <p className="text-sm text-slate-300">Target: Get to 15 referrals (+$35/month)</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                →
                            </div>
                            <div className="w-1 h-20 bg-slate-600 mt-2"></div>
                        </div>
                        <div className="pb-8">
                            <p className="text-white font-semibold">Week 3-4: Viral Growth</p>
                            <p className="text-sm text-slate-300">Target: 3K followers, 50+ daily shares</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                →
                            </div>
                            <div className="w-1 h-20 bg-slate-600 mt-2"></div>
                        </div>
                        <div className="pb-8">
                            <p className="text-white font-semibold">Week 5-8: Partner Expansion</p>
                            <p className="text-sm text-slate-300">Target: 5 new partner referrals</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                →
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-semibold">Week 9-12: Enterprise Prep</p>
                            <p className="text-sm text-slate-300">Reach 5K followers → Unlock Enterprise tier</p>
                        </div>
                    </div>
                </div>

                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                    Get Personalized Coaching
                </Button>
            </Card>

            {/* Support Resources */}
            <Card className="bg-slate-800 border-slate-700 p-6 border-2 border-dashed">
                <h3 className="text-lg font-semibold text-white mb-4">📚 Growth Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                        <Star className="w-4 h-4 mr-2" />
                        Revenue Strategy Guides
                    </Button>
                    <Button variant="outline" className="justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Success Stories & Case Studies
                    </Button>
                    <Button variant="outline" className="justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Growth Analytics Tools
                    </Button>
                    <Button variant="outline" className="justify-start">
                        <Zap className="w-4 h-4 mr-2" />
                        Creator Community Discord
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default GrowthHub;

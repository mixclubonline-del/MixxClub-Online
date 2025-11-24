import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Heart, MessageCircle, Share2, TrendingUp, Users,
    Zap, Gift, Globe, Copy, Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CommunityHubProps {
    userType?: 'artist' | 'engineer';
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ userType }) => {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    const communityStats = {
        totalShares: 847,
        totalLikes: 3421,
        followers: 2156,
        viralScore: 78,
        shareConversionRate: 18.5,
    };

    const recentPosts = [
        {
            id: 1,
            content: 'Just finished a sick remix collaboration! Check it out!',
            timestamp: '2 hours ago',
            likes: 234,
            comments: 45,
            shares: 89,
            engagement: 45,
        },
        {
            id: 2,
            content: 'Mastering tip: Always check your mixes on multiple systems',
            timestamp: '1 day ago',
            likes: 567,
            comments: 123,
            shares: 234,
            engagement: 87,
        },
        {
            id: 3,
            content: 'Behind the scenes: Studio setup tour coming next week!',
            timestamp: '3 days ago',
            likes: 789,
            comments: 156,
            shares: 345,
            engagement: 92,
        },
    ];

    const leaderboardData = [
        { rank: 1, name: 'ProProducer', followers: 45200, viralScore: 95, badge: '👑' },
        { rank: 2, name: 'SonicWave', followers: 38900, viralScore: 89, badge: '🌟' },
        { rank: 3, name: 'BeatMaster', followers: 32100, viralScore: 84, badge: '⭐' },
        { rank: 4, name: 'You', followers: 2156, viralScore: 78, badge: '🎵', isYou: true },
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText('ARTIST-KJ9B2F');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold">Community & Growth</h2>
                <p className="text-slate-400 mt-1">Share, engage, and grow your audience</p>
            </div>

            {/* Community Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Followers</p>
                            <p className="text-2xl font-bold text-white">{communityStats.followers.toLocaleString()}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <Progress value={65} className="mt-4" />
                </Card>

                <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Shares</p>
                            <p className="text-2xl font-bold text-white">{communityStats.totalShares.toLocaleString()}</p>
                        </div>
                        <Share2 className="w-8 h-8 text-green-400" />
                    </div>
                    <Progress value={72} className="mt-4" />
                </Card>

                <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Likes</p>
                            <p className="text-2xl font-bold text-white">{communityStats.totalLikes.toLocaleString()}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                    <Progress value={85} className="mt-4" />
                </Card>

                <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Viral Score</p>
                            <p className="text-2xl font-bold text-white">{communityStats.viralScore}</p>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-400" />
                    </div>
                    <Progress value={communityStats.viralScore} className="mt-4" />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Referral Widget */}
                <Card className="bg-gradient-to-br from-green-900 to-slate-800 border-green-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Referral Code</h3>
                    </div>

                    <p className="text-slate-300 text-sm mb-4">
                        Share your unique code and earn $20 per referral when they subscribe!
                    </p>

                    <div className="bg-slate-900 rounded-lg p-4 mb-4 flex items-center justify-between">
                        <code className="text-green-400 font-mono font-bold">ARTIST-KJ9B2F</code>
                        <button
                            onClick={copyToClipboard}
                            className="text-slate-400 hover:text-green-400 transition"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700 mb-3">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share on Social
                    </Button>

                    <div className="text-sm text-slate-300">
                        <p className="mb-2">📊 This Month: <span className="text-green-400 font-bold">$250</span></p>
                        <p>👥 Active Referrals: <span className="text-green-400 font-bold">12 users</span></p>
                    </div>
                </Card>

                {/* Conversion Stats */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Conversion Stats</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Share Conversion</span>
                                <span className="text-white font-bold">{communityStats.shareConversionRate}%</span>
                            </div>
                            <Progress value={communityStats.shareConversionRate} />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Engagement Rate</span>
                                <span className="text-white font-bold">34.2%</span>
                            </div>
                            <Progress value={34.2} />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Audience Growth</span>
                                <span className="text-white font-bold">+8.5%</span>
                            </div>
                            <Progress value={85} />
                        </div>

                        <Button variant="outline" className="w-full mt-4">
                            View Detailed Analytics
                        </Button>
                    </div>
                </Card>

                {/* Quick Share Tools */}
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Share Channels</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: 'Twitter/X', icon: '𝕏', color: 'hover:text-slate-300' },
                            { name: 'Instagram', icon: '📷', color: 'hover:text-pink-400' },
                            { name: 'TikTok', icon: '🎵', color: 'hover:text-black' },
                            { name: 'LinkedIn', icon: '💼', color: 'hover:text-blue-500' },
                            { name: 'Discord', icon: '💬', color: 'hover:text-indigo-400' },
                            { name: 'Email', icon: '✉️', color: 'hover:text-yellow-400' },
                        ].map((channel) => (
                            <Button
                                key={channel.name}
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <span className="mr-2">{channel.icon}</span>
                                Share on {channel.name}
                            </Button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recent Posts */}
            <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Posts Performance</h3>

                <div className="space-y-4">
                    {recentPosts.map((post) => (
                        <div key={post.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <p className="text-white mb-3">{post.content}</p>

                            <div className="flex items-center justify-between text-sm text-slate-400 mb-3 pb-3 border-b border-slate-700">
                                <span>{post.timestamp}</span>
                                <Badge variant="outline">Engagement: {post.engagement}%</Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-red-400" />
                                    <span>{post.likes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-blue-400" />
                                    <span>{post.comments}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-green-400" />
                                    <span>{post.shares}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Button className="w-full mt-4" variant="outline">
                    View All Posts
                </Button>
            </Card>

            {/* Community Leaderboard */}
            <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🏆 Viral Leaderboard</h3>

                <div className="space-y-3">
                    {leaderboardData.map((entry) => (
                        <div
                            key={entry.rank}
                            className={`flex items-center justify-between p-4 rounded-lg ${entry.isYou
                                    ? 'bg-gradient-to-r from-blue-900 to-slate-900 border-2 border-blue-600'
                                    : 'bg-slate-900 border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold w-6">{entry.badge}</span>
                                <div>
                                    <p className="text-white font-semibold">{entry.name}</p>
                                    <p className="text-sm text-slate-400">{entry.followers.toLocaleString()} followers</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-bold">Score: {entry.viralScore}</p>
                                <p className="text-sm text-slate-400">#{entry.rank}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-dashed border-slate-600">
                    <p className="text-sm text-slate-300 text-center">
                        💡 Share more content to climb the leaderboard and unlock exclusive rewards!
                    </p>
                </div>
            </Card>

            {/* Growth Tips */}
            <Card className="bg-slate-800 border-slate-700 p-6 border-2 border-dashed">
                <h3 className="text-lg font-semibold text-white mb-4">📈 Growth Tips This Week</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 rounded-lg p-4">
                        <p className="font-semibold text-white mb-2">🚀 Post Timing</p>
                        <p className="text-sm text-slate-300">Best time to post: Tuesday-Thursday, 7-9 PM</p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4">
                        <p className="font-semibold text-white mb-2">🎯 Content Focus</p>
                        <p className="text-sm text-slate-300">Your audience loves behind-the-scenes content</p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4">
                        <p className="font-semibold text-white mb-2">💬 Engagement</p>
                        <p className="text-sm text-slate-300">Respond to comments within 2 hours for +15% engagement</p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4">
                        <p className="font-semibold text-white mb-2">🤝 Collaboration</p>
                        <p className="text-sm text-slate-300">Team up with 2-3 creators for viral potential</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CommunityHub;

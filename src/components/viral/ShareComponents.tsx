import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Share2,
    Twitter,
    Facebook,
    Link,
    CheckCircle2,
    Trophy,
    Zap,
    Heart,
} from 'lucide-react';

export interface BattleResult {
    battleId: string;
    userId: string;
    userName: string;
    rank: number; // 1st, 2nd, 3rd
    totalVotes: number;
    winnerName?: string;
    battleTitle: string;
    date: Date;
}

interface ShareBattleResultProps {
    result: BattleResult;
    onShare?: (platform: string) => void;
}

export function ShareBattleResult({ result, onShare }: ShareBattleResultProps) {
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/battles/${result.battleId}?ref=${result.userId}`;

    const rankEmoji = result.rank === 1 ? '🏆' : result.rank === 2 ? '🥈' : '🥉';
    const rankText = result.rank === 1 ? '1st Place' : result.rank === 2 ? '2nd Place' : '3rd Place';

    const shareText = `${rankEmoji} I just won ${rankText} in the "${result.battleTitle}" Mix Battle on MixClub! ${result.totalVotes} people voted for my mix. Can you beat me?`;

    const platforms = [
        {
            id: 'twitter',
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            color: 'text-blue-400',
        },
        {
            id: 'facebook',
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: 'text-blue-600',
        },
    ];

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onShare?.('copy');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleSharePlatform = (platform: string, url: string) => {
        window.open(url, '_blank', 'width=600,height=400');
        onShare?.(platform);
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">Your Battle Result</p>
                        <h3 className="font-bold">You're {rankEmoji} {rankText}!</h3>
                    </div>
                </div>
                <Share2
                    className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setShareOpen(!shareOpen)}
                />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                {result.totalVotes} people voted for your mix in "{result.battleTitle}"
            </p>

            {shareOpen && (
                <div className="space-y-3 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {platforms.map((platform) => {
                            const Icon = platform.icon;
                            return (
                                <Button
                                    key={platform.id}
                                    variant="outline"
                                    className="gap-2 justify-center"
                                    onClick={() => handleSharePlatform(platform.id, platform.url)}
                                >
                                    <Icon className={`w-4 h-4 ${platform.color}`} />
                                    {platform.name}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm"
                            onClick={(e) => e.currentTarget.select()}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                            className="px-3"
                        >
                            <Link className="w-4 h-4 mr-2" />
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}

// Viral Metrics Dashboard Component
export interface ViralMetric {
    metric: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
}

interface ViralMetricsDashboardProps {
    metrics: ViralMetric[];
}

export function ViralMetricsDashboard({ metrics }: ViralMetricsDashboardProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Viral Performance</h3>
            <div className="grid md:grid-cols-2 gap-4">
                {metrics.map((m, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{m.metric}</p>
                                <p className="text-2xl font-bold">{m.value}</p>
                            </div>
                            <div className={`text-sm font-semibold ${m.trend === 'up' ? 'text-green-500' : m.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                                }`}>
                                {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'} {m.change}%
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Invite Friends Widget
interface InviteFriendsWidgetProps {
    onInviteClick?: () => void;
    rewardAmount?: number;
}

export function InviteFriendsWidget({ onInviteClick, rewardAmount = 10 }: InviteFriendsWidgetProps) {
    return (
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <div className="flex items-start gap-4">
                <Heart className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                    <h3 className="font-bold mb-1">Invite Your Friends</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Both of you get ${rewardAmount} credit when they join. Share the love! 🎵
                    </p>
                    <Button onClick={onInviteClick} size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Invite Friends
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// Social Proof Widget - Shows recent activity
export interface SocialProofItem {
    userName: string;
    action: string;
    timestamp: Date;
    icon?: React.ReactNode;
}

interface SocialProofWidgetProps {
    items: SocialProofItem[];
    title?: string;
}

export function SocialProofWidget({ items, title = 'Recently Active' }: SocialProofWidgetProps) {
    const formatTime = (date: Date) => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <Card className="p-6">
            <h3 className="font-bold mb-4">{title}</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm">
                                <span className="font-semibold">{item.userName}</span>{' '}
                                <span className="text-muted-foreground">{item.action}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</p>
                        </div>
                        {item.icon && <div className="text-lg">{item.icon}</div>}
                    </div>
                ))}
            </div>
        </Card>
    );
}

// Share Stats Component
export interface ShareStats {
    views: number;
    clicks: number;
    conversions: number;
}

interface ShareStatsProps {
    stats: ShareStats;
}

export function ShareStats({ stats }: ShareStatsProps) {
    const ctr = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) : '0';
    const conversionRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100).toFixed(1) : '0';

    return (
        <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">{stats.views}</p>
                <p className="text-xs text-muted-foreground mt-2">Views</p>
            </Card>
            <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-500">{stats.clicks}</p>
                <p className="text-xs text-muted-foreground mt-2">CTR: {ctr}%</p>
            </Card>
            <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-green-500">{stats.conversions}</p>
                <p className="text-xs text-muted-foreground mt-2">Conv: {conversionRate}%</p>
            </Card>
        </div>
    );
}

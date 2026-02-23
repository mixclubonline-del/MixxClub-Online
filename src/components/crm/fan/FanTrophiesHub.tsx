/**
 * FanTrophiesHub — Achievement wall, badge collection, and leaderboard.
 * 
 * Promise: "Collect badges, NFT moments, and fan milestones. Your support
 * history is your trophy case — from first listen to VIP status."
 * 
 * Uses useFanStats for real tier/engagement data and useDay1Status
 * for Day 1 achievement tracking. Provides visual trophy showcase.
 */

import { useState } from 'react';
import { useFanStats, calculateTier } from '@/hooks/useFanStats';
import { useDay1Status } from '@/hooks/useDay1Status';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
    Trophy, Star, Award, Crown, Flame, Heart,
    Music, Users, Sparkles, TrendingUp, Share2,
    MessageCircle, Zap, Target, Medal, Gift
} from 'lucide-react';

// Achievement definitions — driven by real fan_stats fields
const ACHIEVEMENT_CATEGORIES = [
    {
        id: 'discovery',
        label: 'Discovery',
        icon: Sparkles,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        achievements: [
            { id: 'first-follow', label: 'First Follow', desc: 'Follow your first artist', icon: '🎵', stat: 'artists_supported', threshold: 1 },
            { id: 'explorer', label: 'Explorer', desc: 'Follow 5 artists', icon: '🧭', stat: 'artists_supported', threshold: 5 },
            { id: 'trailblazer', label: 'Trailblazer', desc: 'Follow 25 artists', icon: '🌟', stat: 'artists_supported', threshold: 25 },
            { id: 'pathfinder', label: 'Pathfinder', desc: 'Follow 100 artists', icon: '🗺️', stat: 'artists_supported', threshold: 100 },
        ],
    },
    {
        id: 'support',
        label: 'Support',
        icon: Heart,
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/20',
        achievements: [
            { id: 'first-day1', label: 'Day 1 OG', desc: 'Get your first Day 1 badge', icon: '⭐', stat: 'day1_badges', threshold: 1 },
            { id: 'early-bird', label: 'Early Bird', desc: 'Earn 5 Day 1 badges', icon: '🐦', stat: 'day1_badges', threshold: 5 },
            { id: 'trendsetter', label: 'Trendsetter', desc: 'Earn 15 Day 1 badges', icon: '🔥', stat: 'day1_badges', threshold: 15 },
            { id: 'kingmaker', label: 'Kingmaker', desc: 'Earn 50 Day 1 badges', icon: '👑', stat: 'day1_badges', threshold: 50 },
        ],
    },
    {
        id: 'engagement',
        label: 'Engagement',
        icon: Zap,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        achievements: [
            { id: 'first-vote', label: 'Voice Heard', desc: 'Cast your first vote', icon: '🗳️', stat: 'total_votes', threshold: 1 },
            { id: 'active-voter', label: 'Active Voter', desc: 'Cast 25 votes', icon: '✅', stat: 'total_votes', threshold: 25 },
            { id: 'first-share', label: 'Amplifier', desc: 'Share an artist', icon: '📢', stat: 'total_shares', threshold: 1 },
            { id: 'mega-sharer', label: 'Megaphone', desc: 'Share 50 times', icon: '🔊', stat: 'total_shares', threshold: 50 },
        ],
    },
    {
        id: 'loyalty',
        label: 'Loyalty',
        icon: Flame,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        achievements: [
            { id: 'streaker-7', label: 'Week Warrior', desc: '7-day engagement streak', icon: '🔥', stat: 'longest_streak', threshold: 7 },
            { id: 'streaker-14', label: 'Fortnight Fire', desc: '14-day streak', icon: '💪', stat: 'longest_streak', threshold: 14 },
            { id: 'streaker-30', label: 'Monthly Master', desc: '30-day streak', icon: '🏆', stat: 'longest_streak', threshold: 30 },
            { id: 'streaker-100', label: 'Legendary', desc: '100-day streak', icon: '💎', stat: 'longest_streak', threshold: 100 },
        ],
    },
];

function AchievementCard({
    achievement,
    currentValue,
    isUnlocked
}: {
    achievement: typeof ACHIEVEMENT_CATEGORIES[0]['achievements'][0];
    currentValue: number;
    isUnlocked: boolean;
}) {
    const progress = Math.min((currentValue / achievement.threshold) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                variant="glass"
                className={`transition-all ${isUnlocked
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'opacity-70'
                    }`}
            >
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <span className={`text-2xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                            {achievement.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold truncate">{achievement.label}</h4>
                                {isUnlocked && (
                                    <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 px-1.5">
                                        ✓
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                            {!isUnlocked && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">{currentValue} / {achievement.threshold}</span>
                                        <span className="text-muted-foreground">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1" />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export const FanTrophiesHub = () => {
    const { user } = useAuth();
    const { stats, isLoading: statsLoading, currentTier } = useFanStats();
    const { stats: day1Stats, isLoadingMyArtists } = useDay1Status();
    const [activeTab, setActiveTab] = useState('all');

    if (statsLoading || isLoadingMyArtists) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
            </div>
        );
    }

    // Build stat lookup from real data
    const statValues: Record<string, number> = {
        artists_supported: stats?.artists_supported || 0,
        day1_badges: stats?.day1_badges || 0,
        total_votes: stats?.total_votes || 0,
        total_shares: stats?.total_shares || 0,
        total_comments: stats?.total_comments || 0,
        total_premieres_attended: stats?.total_premieres_attended || 0,
        longest_streak: stats?.longest_streak || 0,
        engagement_streak: stats?.engagement_streak || 0,
        mixxcoinz_earned: stats?.mixxcoinz_earned || 0,
    };

    // Count unlocked achievements
    const totalAchievements = ACHIEVEMENT_CATEGORIES.flatMap(c => c.achievements);
    const unlockedCount = totalAchievements.filter(a =>
        (statValues[a.stat] || 0) >= a.threshold
    ).length;

    // Tier progression
    const tierOrder = ['newcomer', 'supporter', 'advocate', 'champion', 'legend'];
    const currentTierIndex = tierOrder.indexOf(currentTier);
    const tierThresholds = [0, 500, 2000, 5000, 10000];
    const nextTierThreshold = currentTierIndex < 4 ? tierThresholds[currentTierIndex + 1] : tierThresholds[4];
    const tierProgress = ((stats?.mixxcoinz_earned || 0) / nextTierThreshold) * 100;

    return (
        <div className="space-y-6">
            {/* Trophy Summary */}
            <Card variant="glass" className="border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/5 overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black">{unlockedCount}</h2>
                                <span className="text-muted-foreground">/ {totalAchievements.length} Achievements</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="capitalize bg-primary/20 text-primary">{currentTier}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    Discovery Score: {day1Stats.discoveryScore}
                                </span>
                            </div>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-3xl font-black text-amber-400">
                                {stats?.mixxcoinz_earned?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">MixxCoinz</p>
                        </div>
                    </div>

                    {/* Tier progress */}
                    {currentTierIndex < 4 && (
                        <div className="mt-4 pt-4 border-t border-border/30">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="capitalize text-muted-foreground">
                                    Next: {tierOrder[currentTierIndex + 1]}
                                </span>
                                <span className="text-muted-foreground">
                                    {(stats?.mixxcoinz_earned || 0).toLocaleString()} / {nextTierThreshold.toLocaleString()} coinz
                                </span>
                            </div>
                            <Progress value={Math.min(tierProgress, 100)} className="h-2" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Category Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ACHIEVEMENT_CATEGORIES.map((category) => {
                    const catUnlocked = category.achievements.filter(a =>
                        (statValues[a.stat] || 0) >= a.threshold
                    ).length;
                    return (
                        <Card
                            key={category.id}
                            variant="glass"
                            className="cursor-pointer hover:border-primary/20 transition-all"
                            onClick={() => setActiveTab(category.id)}
                        >
                            <CardContent className="p-4 text-center">
                                <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center mx-auto mb-2`}>
                                    <category.icon className={`w-5 h-5 ${category.color}`} />
                                </div>
                                <p className="text-sm font-semibold">{category.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {catUnlocked}/{category.achievements.length}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Achievement Grid */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-5 w-full max-w-lg">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    {ACHIEVEMENT_CATEGORIES.map((cat) => (
                        <TabsTrigger key={cat.id} value={cat.id} className="text-xs gap-1">
                            <cat.icon className="w-3 h-3" />
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all" className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {totalAchievements.map((achievement) => {
                            const value = statValues[achievement.stat] || 0;
                            return (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    currentValue={value}
                                    isUnlocked={value >= achievement.threshold}
                                />
                            );
                        })}
                    </div>
                </TabsContent>

                {ACHIEVEMENT_CATEGORIES.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                                <category.icon className={`w-4 h-4 ${category.color}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold">{category.label} Achievements</h3>
                                <p className="text-xs text-muted-foreground">
                                    {category.achievements.filter(a => (statValues[a.stat] || 0) >= a.threshold).length} / {category.achievements.length} unlocked
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {category.achievements.map((achievement) => {
                                const value = statValues[achievement.stat] || 0;
                                return (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                        currentValue={value}
                                        isUnlocked={value >= achievement.threshold}
                                    />
                                );
                            })}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Share Trophy Card */}
            <Card variant="glass" className="border-dashed border-2 border-border/40">
                <CardContent className="p-5 text-center">
                    <Share2 className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="font-semibold mb-1">Share Your Trophies</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Show off your achievement wall and Discovery Score
                    </p>
                    <Button variant="outline" className="text-sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Generate Trophy Card
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

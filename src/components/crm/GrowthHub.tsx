/**
 * GrowthHub — Career coaching & growth tracking for Artist/Engineer/Producer.
 * 
 * Promises from landing pages:
 * - Artists: "Growth Academy" with XP Progression, Goal Setting, and Career Coaching
 * - Engineers: "Growth Academy" with Skill Tracking, Goal Setting, Peer Coaching, Certifications
 * - Producers: "Scale Your Brand" with Brand Analytics, Trend Forecasting, Client CRM
 * 
 * All data sourced from real Supabase tables: achievements, projects, engineer_earnings,
 * marketplace_purchases, profiles, and partnerships.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Rocket, Award, TrendingUp, Zap, Users, Target,
    Star, Crown, ArrowRight, CheckCircle2, Clock,
    Flame, Trophy, Sparkles, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GrowthHubProps {
    userType?: 'artist' | 'engineer' | 'producer';
}

// Growth tier system — computed from real activity
const GROWTH_TIERS = [
    { name: 'Newcomer', minXP: 0, icon: '🌱', color: 'text-emerald-400' },
    { name: 'Rising', minXP: 100, icon: '⭐', color: 'text-blue-400' },
    { name: 'Established', minXP: 500, icon: '🔥', color: 'text-orange-400' },
    { name: 'Pro', minXP: 1500, icon: '💎', color: 'text-purple-400' },
    { name: 'Elite', minXP: 5000, icon: '👑', color: 'text-amber-400' },
];

function computeTier(xp: number) {
    for (let i = GROWTH_TIERS.length - 1; i >= 0; i--) {
        if (xp >= GROWTH_TIERS[i].minXP) return { current: GROWTH_TIERS[i], index: i };
    }
    return { current: GROWTH_TIERS[0], index: 0 };
}

export const GrowthHub: React.FC<GrowthHubProps> = ({ userType = 'artist' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch real growth data from multiple Supabase tables
    const { data: growthData, isLoading } = useQuery({
        queryKey: ['growth-hub-data', user?.id, userType],
        queryFn: async () => {
            if (!user?.id) return null;

            // 1. Achievements
            const { data: achievements } = await supabase
                .from('achievements')
                .select('*')
                .eq('user_id', user.id)
                .order('earned_at', { ascending: false });

            // 2. Projects
            const projectQuery = userType === 'engineer'
                ? supabase.from('projects').select('id, status, created_at, updated_at').eq('engineer_id', user.id)
                : supabase.from('projects').select('id, status, created_at, updated_at').eq('client_id', user.id);
            const { data: projects } = await projectQuery;

            // 3. Earnings (for engineers & producers)
            const { data: earnings } = await supabase
                .from('engineer_earnings')
                .select('total_amount, bonus_amount, status, created_at')
                .eq('engineer_id', user.id);

            // 4. Marketplace sales (for producers)
            const { data: sales } = await supabase
                .from('marketplace_purchases')
                .select('purchase_amount, created_at')
                .eq('seller_id', user.id);

            // 5. Partnerships
            const { data: partnerships } = await supabase
                .from('partnerships')
                .select('id, status')
                .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`);

            // 6. Profile for follower count
            const { data: profile } = await supabase
                .from('profiles')
                .select('follower_count, created_at')
                .eq('id', user.id)
                .single();

            // Compute XP from real activity
            const totalProjects = projects?.length || 0;
            const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
            const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
            const achievementCount = achievements?.length || 0;
            const totalEarnings = earnings?.reduce((s, e) => s + Number(e.total_amount || 0), 0) || 0;
            const totalSales = sales?.reduce((s, p) => s + Number(p.purchase_amount || 0), 0) || 0;
            const partnershipCount = partnerships?.filter(p => p.status === 'active').length || 0;
            const followerCount = profile?.follower_count || 0;

            // XP formula: 50/project + 25/achievement + 10/partnership + 1 per $10 earned + 1 per 5 followers
            const xp = (completedProjects * 50) + (achievementCount * 25) + (partnershipCount * 10)
                + Math.floor((totalEarnings + totalSales) / 10) + Math.floor(followerCount / 5);

            // Time on platform
            const joinDate = profile?.created_at ? new Date(profile.created_at) : new Date();
            const daysOnPlatform = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

            // Recent activity (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentProjects = projects?.filter(p =>
                new Date(p.created_at) >= thirtyDaysAgo
            ).length || 0;

            return {
                xp,
                totalProjects,
                completedProjects,
                activeProjects,
                achievementCount,
                achievements: achievements || [],
                totalEarnings,
                totalSales,
                partnershipCount,
                followerCount,
                daysOnPlatform,
                recentProjects,
            };
        },
        enabled: !!user?.id,
        staleTime: 60000,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <Skeleton className="h-48 rounded-2xl" />
            </div>
        );
    }

    if (!growthData) return null;

    const { current: currentTier, index: tierIndex } = computeTier(growthData.xp);
    const nextTier = tierIndex < GROWTH_TIERS.length - 1 ? GROWTH_TIERS[tierIndex + 1] : null;
    const progressToNext = nextTier
        ? ((growthData.xp - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100
        : 100;

    // Dynamic goals based on real state
    const goals = [
        {
            label: 'Complete a project',
            target: 1,
            current: growthData.completedProjects,
            done: growthData.completedProjects >= 1,
            xpReward: 50,
            action: () => navigate('?tab=active-work'),
        },
        {
            label: 'Earn 5 achievements',
            target: 5,
            current: growthData.achievementCount,
            done: growthData.achievementCount >= 5,
            xpReward: 125,
            action: () => navigate('?tab=community'),
        },
        {
            label: 'Build 3 partnerships',
            target: 3,
            current: growthData.partnershipCount,
            done: growthData.partnershipCount >= 3,
            xpReward: 30,
            action: () => navigate('?tab=matches'),
        },
        {
            label: userType === 'producer' ? 'Make 10 beat sales' : 'Complete 10 sessions',
            target: 10,
            current: userType === 'producer' ? Math.floor(growthData.totalSales / 50) : growthData.completedProjects,
            done: (userType === 'producer' ? Math.floor(growthData.totalSales / 50) : growthData.completedProjects) >= 10,
            xpReward: 500,
            action: () => navigate(userType === 'producer' ? '?tab=catalog' : '?tab=sessions'),
        },
        {
            label: 'Grow to 100 followers',
            target: 100,
            current: growthData.followerCount,
            done: growthData.followerCount >= 100,
            xpReward: 20,
            action: () => navigate('?tab=profile'),
        },
    ];

    const completedGoals = goals.filter(g => g.done).length;

    // Role-specific labels
    const roleLabels = {
        artist: { title: 'Career Growth', subtitle: 'Level up your music career', primary: 'text-purple-400' },
        engineer: { title: 'Business Growth', subtitle: 'Scale your audio business', primary: 'text-orange-400' },
        producer: { title: 'Brand Growth', subtitle: 'Grow your producer empire', primary: 'text-amber-400' },
    };
    const labels = roleLabels[userType];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold">{labels.title}</h2>
                <p className="text-muted-foreground mt-1">{labels.subtitle}</p>
            </motion.div>

            {/* Tier Banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{currentTier.icon}</span>
                                <div>
                                    <p className={`text-2xl font-black ${currentTier.color}`}>{currentTier.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {growthData.xp.toLocaleString()} XP earned • {growthData.daysOnPlatform} days on MixxClub
                                    </p>
                                </div>
                            </div>
                            {nextTier && (
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Next tier</p>
                                    <p className="text-sm font-semibold">{nextTier.icon} {nextTier.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(nextTier.minXP - growthData.xp).toLocaleString()} XP to go
                                    </p>
                                </div>
                            )}
                        </div>
                        <Progress value={progressToNext} className="h-2" />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, label: 'Completed', value: growthData.completedProjects, sub: `of ${growthData.totalProjects} projects` },
                    { icon: <Award className="w-5 h-5 text-amber-400" />, label: 'Achievements', value: growthData.achievementCount, sub: 'badges earned' },
                    { icon: <Users className="w-5 h-5 text-blue-400" />, label: 'Partnerships', value: growthData.partnershipCount, sub: 'active collabs' },
                    { icon: <TrendingUp className="w-5 h-5 text-purple-400" />, label: 'Followers', value: growthData.followerCount, sub: 'community reach' },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                        <Card className="border-white/8 bg-white/[0.03] backdrop-blur-xl">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {stat.icon}
                                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Growth Goals — Dynamic based on real state */}
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Growth Goals</h3>
                                <p className="text-xs text-muted-foreground">{completedGoals}/{goals.length} completed</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 border-primary/20">
                            +{goals.filter(g => !g.done).reduce((s, g) => s + g.xpReward, 0)} XP available
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {goals.map((goal, idx) => (
                            <motion.div
                                key={goal.label}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + idx * 0.05 }}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:bg-white/[0.04] ${goal.done
                                        ? 'border-green-500/20 bg-green-500/5'
                                        : 'border-white/8 bg-white/[0.02]'
                                    }`}
                                onClick={goal.action}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {goal.done ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${goal.done ? 'line-through text-muted-foreground' : ''}`}>
                                            {goal.label}
                                        </p>
                                        {!goal.done && (
                                            <Progress
                                                value={Math.min((goal.current / goal.target) * 100, 100)}
                                                className="h-1 mt-1.5 max-w-[200px]"
                                            />
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {goal.current}/{goal.target} • +{goal.xpReward} XP
                                        </p>
                                    </div>
                                </div>
                                {!goal.done && (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Achievements */}
            {growthData.achievements.length > 0 && (
                <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="font-semibold">Recent Achievements</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {growthData.achievements.slice(0, 6).map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                        <Star className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{achievement.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(achievement.earned_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-xs">
                                        +25 XP
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tier Progression Roadmap */}
            <Card className="border-white/10 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-xl">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Tier Progression</h3>
                    </div>

                    <div className="space-y-3">
                        {GROWTH_TIERS.map((tier, idx) => {
                            const isReached = growthData.xp >= tier.minXP;
                            const isCurrent = idx === tierIndex;
                            return (
                                <div
                                    key={tier.name}
                                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isCurrent ? 'border-primary/30 bg-primary/5' : isReached ? 'border-green-500/20 bg-green-500/5' : 'border-white/8 bg-white/[0.02] opacity-50'
                                        }`}
                                >
                                    <span className="text-2xl">{tier.icon}</span>
                                    <div className="flex-1">
                                        <p className={`font-semibold ${isCurrent ? tier.color : isReached ? 'text-green-400' : 'text-muted-foreground'}`}>
                                            {tier.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{tier.minXP.toLocaleString()} XP required</p>
                                    </div>
                                    {isCurrent && <Badge className="bg-primary/20 text-primary border-primary/30">Current</Badge>}
                                    {isReached && !isCurrent && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                    onClick={() => navigate('?tab=opportunities')}
                    className="h-auto p-4 justify-start bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]"
                    variant="ghost"
                >
                    <Sparkles className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                        <p className="font-medium">Browse Opportunities</p>
                        <p className="text-xs text-muted-foreground">Find new projects to grow your XP</p>
                    </div>
                </Button>
                <Button
                    onClick={() => navigate('?tab=community')}
                    className="h-auto p-4 justify-start bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]"
                    variant="ghost"
                >
                    <Users className="w-5 h-5 mr-3 text-blue-400" />
                    <div className="text-left">
                        <p className="font-medium">Join the Community</p>
                        <p className="text-xs text-muted-foreground">Connect with peers and grow together</p>
                    </div>
                </Button>
            </div>
        </div>
    );
};

export default GrowthHub;

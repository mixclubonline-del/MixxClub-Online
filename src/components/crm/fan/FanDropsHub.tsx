/**
 * FanDropsHub — Release calendar, drop alerts, and exclusive content.
 * 
 * Promise: "Get notified the instant your favorite artists drop new music,
 * announce shows, or open exclusive fan experiences."
 * 
 * Queries real notification/release data where available. Provides
 * release calendar, alert preferences, and exclusive content shelf.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFanStats } from '@/hooks/useFanStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
    Bell, Calendar, Clock, Music, Disc3, Lock,
    Sparkles, Volume2, Mail, Smartphone, Star,
    TrendingUp, Play, Eye, Gift
} from 'lucide-react';

export const FanDropsHub = () => {
    const { user } = useAuth();
    const { stats, currentTier } = useFanStats();
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(true);

    // Fetch recent releases from day1 artists
    const { data: artistDrops, isLoading } = useQuery({
        queryKey: ['fan-drops', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            // Get Day 1 artist IDs
            const { data: day1s } = await supabase
                .from('artist_day1s')
                .select('artist_id')
                .eq('fan_id', user.id);

            if (!day1s || day1s.length === 0) return [];

            const artistIds = day1s.map(d => d.artist_id);

            // Get artist profiles for display
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, genre')
                .in('id', artistIds) as any;

            return (profiles || []).map((p: any) => ({
                id: p.id,
                artistName: p.full_name || 'Unknown',
                avatar: p.avatar_url,
                genre: p.genre,
                hasNewRelease: Math.random() > 0.5, // Will be real when releases table is connected
            }));
        },
        enabled: !!user?.id,
        staleTime: 60000,
    });

    // Release calendar data
    const upcomingReleases = [
        {
            id: 'r-1',
            title: 'Midnight Sessions EP',
            artist: 'Your Day 1 Artist',
            type: 'EP',
            date: 'Feb 28, 2026',
            status: 'upcoming' as const,
            exclusive: false,
        },
        {
            id: 'r-2',
            title: 'Unreleased Demo',
            artist: 'Emerging Producer',
            type: 'Single',
            date: 'Mar 5, 2026',
            status: 'upcoming' as const,
            exclusive: true,
        },
        {
            id: 'r-3',
            title: 'Live at the Studio',
            artist: 'Underground Vocalist',
            type: 'Live Recording',
            date: 'Mar 12, 2026',
            status: 'upcoming' as const,
            exclusive: true,
        },
    ];

    // Exclusive content tiers
    const exclusiveTiers = [
        {
            tier: 'newcomer',
            label: 'Newcomer',
            unlocked: true,
            content: 'Community playlist access',
            icon: Music,
        },
        {
            tier: 'supporter',
            label: 'Supporter',
            unlocked: currentTier !== 'newcomer',
            content: 'Early release previews (24hr before)',
            icon: Clock,
        },
        {
            tier: 'advocate',
            label: 'Advocate',
            unlocked: ['advocate', 'champion', 'legend'].includes(currentTier),
            content: 'Behind-the-scenes studio sessions',
            icon: Eye,
        },
        {
            tier: 'champion',
            label: 'Champion',
            unlocked: ['champion', 'legend'].includes(currentTier),
            content: 'Exclusive unreleased tracks',
            icon: Star,
        },
        {
            tier: 'legend',
            label: 'Legend',
            unlocked: currentTier === 'legend',
            content: 'Personal listening parties with artists',
            icon: Gift,
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Alert Status */}
            <Card variant="glass" className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Drop Alerts</h3>
                                <p className="text-sm text-muted-foreground">
                                    Tracking {artistDrops?.length || 0} artists
                                </p>
                            </div>
                        </div>
                        <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="calendar" className="text-xs gap-1">
                        <Calendar className="w-3 h-3" />
                        Calendar
                    </TabsTrigger>
                    <TabsTrigger value="exclusive" className="text-xs gap-1">
                        <Lock className="w-3 h-3" />
                        Exclusive
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs gap-1">
                        <Bell className="w-3 h-3" />
                        Preferences
                    </TabsTrigger>
                </TabsList>

                {/* Release Calendar */}
                <TabsContent value="calendar" className="space-y-3">
                    {upcomingReleases.length === 0 ? (
                        <Card variant="glass" className="text-center py-12">
                            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No upcoming releases</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Follow more artists to see their upcoming drops
                            </p>
                        </Card>
                    ) : (
                        upcomingReleases.map((release, index) => (
                            <motion.div
                                key={release.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card variant="glass" className="hover:border-primary/30 transition-all">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${release.exclusive ? 'bg-amber-500/20' : 'bg-primary/20'
                                                }`}>
                                                {release.exclusive ? (
                                                    <Star className="w-6 h-6 text-amber-400" />
                                                ) : (
                                                    <Disc3 className="w-6 h-6 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{release.title}</h3>
                                                    {release.exclusive && (
                                                        <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                                                            Exclusive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{release.artist}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {release.date}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">{release.type}</Badge>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" className="shrink-0 text-xs">
                                                <Bell className="w-3 h-3 mr-1" />
                                                Remind
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </TabsContent>

                {/* Exclusive Content Tiers */}
                <TabsContent value="exclusive" className="space-y-3">
                    <Card variant="glass" className="mb-4">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Your fan tier unlocks exclusive content. Earn more MixxCoinz to level up.
                            </p>
                            <Badge className="mt-2 capitalize">{currentTier}</Badge>
                        </CardContent>
                    </Card>

                    {exclusiveTiers.map((tier, index) => (
                        <motion.div
                            key={tier.tier}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                variant="glass"
                                className={`transition-all ${tier.unlocked
                                        ? 'border-green-500/20'
                                        : 'opacity-60 border-border/30'
                                    }`}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.unlocked ? 'bg-green-500/20' : 'bg-muted/20'
                                            }`}>
                                            {tier.unlocked ? (
                                                <tier.icon className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Lock className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{tier.label}</h3>
                                                {tier.unlocked && (
                                                    <Badge className="text-xs bg-green-500/20 text-green-400">Unlocked</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{tier.content}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </TabsContent>

                {/* Alert Preferences */}
                <TabsContent value="settings" className="space-y-4">
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="text-lg">Notification Channels</CardTitle>
                            <CardDescription>Choose how you want to be notified about drops</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Push Notifications</p>
                                        <p className="text-xs text-muted-foreground">Instant alerts on your device</p>
                                    </div>
                                </div>
                                <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-xs text-muted-foreground">Daily digest of new releases</p>
                                    </div>
                                </div>
                                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="text-lg">Alert Priority</CardTitle>
                            <CardDescription>Customize alerts by artist importance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium">Day 1 Artists</p>
                                    <p className="text-xs text-muted-foreground">Artists you supported early</p>
                                </div>
                                <Badge className="bg-amber-500/20 text-amber-400">Instant</Badge>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium">Following</p>
                                    <p className="text-xs text-muted-foreground">Artists you follow</p>
                                </div>
                                <Badge variant="outline">Same Day</Badge>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium">Recommendations</p>
                                    <p className="text-xs text-muted-foreground">AI-suggested artists</p>
                                </div>
                                <Badge variant="outline">Weekly Digest</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

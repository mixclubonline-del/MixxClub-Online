/**
 * FanCommunitiesHub — Artist communities, listening parties, and fan circles.
 * 
 * Promise: "Get into artist-specific rooms, fan circles, and listening parties.
 * Connect with people who share your exact taste — not just a genre."
 * 
 * Queries real community data where available; provides rich UI for 
 * community discovery, listening events, and fan circle management.
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Music, Radio, Headphones, MessageCircle,
    Search, Calendar, Clock, Sparkles, ArrowRight,
    Globe, Lock, Heart, Mic
} from 'lucide-react';

interface ArtistCommunity {
    id: string;
    artist_id: string;
    full_name: string;
    avatar_url: string | null;
    genre: string | null;
    follower_count: number;
    memberCount: number;
}

export const FanCommunitiesHub = () => {
    const { user } = useAuth();
    const { stats, currentTier } = useFanStats();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('my-circles');

    // Fetch artists the user follows (via Day 1s) to show as communities
    const { data: artistCommunities, isLoading } = useQuery({
        queryKey: ['fan-communities', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            // Get Day 1 artists as community sources
            const { data: day1s, error } = await supabase
                .from('artist_day1s')
                .select(`
          artist_id,
          artist:profiles!artist_day1s_artist_id_fkey (
            id, full_name, avatar_url, genre, follower_count
          )
        `)
                .eq('fan_id', user.id)
                .order('followed_at', { ascending: false });

            if (error) {
                console.error('Error fetching communities:', error);
                return [];
            }

            return (day1s || []).map(d => ({
                id: d.artist_id,
                artist_id: d.artist_id,
                full_name: (d.artist as any)?.full_name || 'Unknown',
                avatar_url: (d.artist as any)?.avatar_url || null,
                genre: (d.artist as any)?.genre || null,
                follower_count: (d.artist as any)?.follower_count || 0,
                memberCount: Math.max(1, (d.artist as any)?.follower_count || 0),
            })) as ArtistCommunity[];
        },
        enabled: !!user?.id,
        staleTime: 60000,
    });

    // Discover new communities — artists the user hasn't followed
    const { data: discoverCommunities } = useQuery({
        queryKey: ['discover-communities', searchQuery],
        queryFn: async () => {
            let query = supabase
                .from('profiles')
                .select('id, full_name, avatar_url, genre, follower_count')
                .eq('role', 'artist')
                .gt('follower_count', 0)
                .order('follower_count', { ascending: false })
                .limit(12);

            if (searchQuery) {
                query = query.ilike('full_name', `%${searchQuery}%`);
            }

            const { data, error } = await query as any;
            if (error) return [];
            return (data || []).map((a: any) => ({
                id: a.id,
                artist_id: a.id,
                full_name: a.full_name || 'Unknown',
                avatar_url: a.avatar_url,
                genre: a.genre,
                follower_count: a.follower_count || 0,
                memberCount: a.follower_count || 0,
            })) as ArtistCommunity[];
        },
        enabled: activeTab === 'discover',
        staleTime: 30000,
    });

    // Listening parties — upcoming virtual events
    const listeningParties = [
        {
            id: 'lp-1',
            title: 'New Music Friday Live',
            description: 'Listen to this week\'s freshest drops together',
            time: 'Every Friday at 8PM',
            attendees: 42,
            status: 'upcoming' as const,
            icon: Radio,
        },
        {
            id: 'lp-2',
            title: 'Underground Spotlight',
            description: 'Discover artists with less than 50 followers',
            time: 'Wednesdays at 9PM',
            attendees: 28,
            status: 'upcoming' as const,
            icon: Sparkles,
        },
        {
            id: 'lp-3',
            title: 'Genre Deep Dive',
            description: 'This week: Experimental R&B × Lo-fi',
            time: 'Sundays at 7PM',
            attendees: 35,
            status: 'upcoming' as const,
            icon: Headphones,
        },
    ];

    // Taste neighborhoods
    const tasteNeighborhoods = [
        { id: 'tn-1', name: 'Lo-fi R&B Heads', members: 1240, genre: 'R&B', vibe: '🌙' },
        { id: 'tn-2', name: 'Beat Diggers', members: 890, genre: 'Hip-Hop', vibe: '🎯' },
        { id: 'tn-3', name: 'Indie Soul Collective', members: 560, genre: 'Soul', vibe: '🌊' },
        { id: 'tn-4', name: 'Future Bass Universe', members: 2100, genre: 'Electronic', vibe: '🚀' },
        { id: 'tn-5', name: 'Acoustic Sessions', members: 740, genre: 'Acoustic', vibe: '🎸' },
        { id: 'tn-6', name: 'Afrobeats Connect', members: 1800, genre: 'Afrobeats', vibe: '🌍' },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            </div>
        );
    }

    const communities = activeTab === 'discover' ? (discoverCommunities || []) : (artistCommunities || []);

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card variant="glass">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{artistCommunities?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Communities</p>
                    </CardContent>
                </Card>
                <Card variant="glass">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{listeningParties.length}</p>
                        <p className="text-xs text-muted-foreground">Upcoming Events</p>
                    </CardContent>
                </Card>
                <Card variant="glass">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold capitalize">{currentTier}</p>
                        <p className="text-xs text-muted-foreground">Access Tier</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-4 w-full max-w-lg">
                    <TabsTrigger value="my-circles" className="text-xs gap-1">
                        <Users className="w-3 h-3" />
                        My Circles
                    </TabsTrigger>
                    <TabsTrigger value="listening" className="text-xs gap-1">
                        <Radio className="w-3 h-3" />
                        Events
                    </TabsTrigger>
                    <TabsTrigger value="taste" className="text-xs gap-1">
                        <Heart className="w-3 h-3" />
                        Taste Groups
                    </TabsTrigger>
                    <TabsTrigger value="discover" className="text-xs gap-1">
                        <Search className="w-3 h-3" />
                        Discover
                    </TabsTrigger>
                </TabsList>

                {/* My Artist Circles */}
                <TabsContent value="my-circles" className="space-y-3">
                    {communities.length === 0 ? (
                        <Card variant="glass" className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground font-medium">No communities yet</p>
                            <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
                                Follow artists to join their communities
                            </p>
                            <Button size="sm" onClick={() => navigate('/fan-hub?tab=feed')}>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Discover Artists
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {communities.map((community, index) => (
                                <motion.div
                                    key={community.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card variant="glass" className="group hover:border-primary/30 transition-all cursor-pointer">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-12 h-12 ring-2 ring-border/30">
                                                    <AvatarImage src={community.avatar_url || ''} />
                                                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                        {community.full_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{community.full_name}'s Circle</h3>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {community.memberCount.toLocaleString()} fans
                                                        </span>
                                                        {community.genre && (
                                                            <span className="flex items-center gap-1">
                                                                <Music className="w-3 h-3" />
                                                                {community.genre}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                                                    Joined
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Listening Parties */}
                <TabsContent value="listening" className="space-y-3">
                    {listeningParties.map((party, index) => (
                        <motion.div
                            key={party.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card variant="glass" className="hover:border-primary/30 transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                            <party.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold">{party.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{party.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {party.time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {party.attendees} going
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="shrink-0">
                                            RSVP
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </TabsContent>

                {/* Taste Neighborhoods */}
                <TabsContent value="taste" className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tasteNeighborhoods.map((tn, index) => (
                            <motion.div
                                key={tn.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card variant="glass" className="hover:border-primary/30 transition-all cursor-pointer">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{tn.vibe}</span>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{tn.name}</h3>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {tn.members.toLocaleString()} members
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">{tn.genre}</Badge>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" className="text-xs">
                                                Join
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* Discover Communities */}
                <TabsContent value="discover" className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search artist communities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(discoverCommunities || []).map((community, index) => (
                            <motion.div
                                key={community.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card variant="glass" className="group hover:border-primary/30 transition-all cursor-pointer">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={community.avatar_url || ''} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                    {community.full_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{community.full_name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{community.memberCount.toLocaleString()} fans</span>
                                                    {community.genre && (
                                                        <Badge variant="outline" className="text-xs">{community.genre}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => navigate(`/profile/${community.artist_id}`)}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

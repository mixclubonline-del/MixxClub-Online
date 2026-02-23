/**
 * FanConnectHub — Direct artist connections, creative voting, and meet & greets.
 * 
 * Promise: "Send direct messages to artists, vote on their next single artwork,
 * participate in creative decisions, and attend virtual meet & greets."
 * 
 * Provides tiered artist connection system based on fan score,
 * creative voting interface, and M&G event management.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFanStats } from '@/hooks/useFanStats';
import { useDay1Status } from '@/hooks/useDay1Status';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
    MessageCircle, Vote, Calendar, Users, Star,
    Send, Crown, Heart, Sparkles, Lock, ArrowRight,
    Video, Mic, HelpCircle, Clock
} from 'lucide-react';

// Connection tier thresholds
const CONNECTION_TIERS = [
    { tier: 'listener', label: 'Listener', icon: '🎧', dmSlots: 0, perks: 'Follow and support' },
    { tier: 'supporter', label: 'Supporter', icon: '💫', dmSlots: 1, perks: '1 DM per month' },
    { tier: 'day1', label: 'Day 1', icon: '⭐', dmSlots: 5, perks: '5 DMs + voting access' },
    { tier: 'vip', label: 'VIP', icon: '👑', dmSlots: -1, perks: 'Unlimited DMs + M&G access' },
];

export const FanConnectHub = () => {
    const { user } = useAuth();
    const { stats, currentTier } = useFanStats();
    const { myDay1Artists, isLoadingMyArtists, stats: day1Stats } = useDay1Status();
    const [activeTab, setActiveTab] = useState('connections');
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');

    // Compute connection level based on tier
    const connectionLevel = currentTier === 'legend' ? 'vip'
        : currentTier === 'champion' ? 'day1'
            : currentTier === 'advocate' ? 'supporter'
                : 'listener';

    const currentConnectionTier = CONNECTION_TIERS.find(t => t.tier === connectionLevel) || CONNECTION_TIERS[0];
    const tierIndex = CONNECTION_TIERS.findIndex(t => t.tier === connectionLevel);

    // Active polls/votes
    const activePolls = [
        {
            id: 'poll-1',
            question: 'Which cover art should we use for the next single?',
            artist: 'Studio Artist',
            options: [
                { id: 'a', label: 'Neon City', votes: 245 },
                { id: 'b', label: 'Sunset Wave', votes: 312 },
                { id: 'c', label: 'Midnight Glow', votes: 178 },
            ],
            totalVotes: 735,
            endsIn: '2 days',
            voted: false,
        },
        {
            id: 'poll-2',
            question: 'What genre should the next EP explore?',
            artist: 'Rising Producer',
            options: [
                { id: 'a', label: 'Lo-fi R&B', votes: 189 },
                { id: 'b', label: 'Neo-Soul', votes: 267 },
                { id: 'c', label: 'Chillwave', votes: 145 },
            ],
            totalVotes: 601,
            endsIn: '5 days',
            voted: false,
        },
    ];

    // Upcoming M&Gs
    const meetAndGreets = [
        {
            id: 'mg-1',
            title: 'Virtual Studio Tour & Q&A',
            artist: 'Featured Producer',
            date: 'Mar 15, 2026 at 7PM EST',
            spots: 25,
            spotsRemaining: 8,
            tierRequired: 'day1',
            type: 'video' as const,
        },
        {
            id: 'mg-2',
            title: 'Listening Party + AMA',
            artist: 'Underground Vocalist',
            date: 'Mar 22, 2026 at 8PM EST',
            spots: 50,
            spotsRemaining: 23,
            tierRequired: 'supporter',
            type: 'audio' as const,
        },
    ];

    if (isLoadingMyArtists) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Connection Level Banner */}
            <Card variant="glass" className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-3xl">{currentConnectionTier.icon}</span>
                        <div>
                            <h3 className="font-bold text-lg">{currentConnectionTier.label} Access</h3>
                            <p className="text-sm text-muted-foreground">{currentConnectionTier.perks}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {CONNECTION_TIERS.map((t, i) => (
                            <div
                                key={t.tier}
                                className={`flex-1 h-2 rounded-full ${i <= tierIndex ? 'bg-primary' : 'bg-muted/30'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1">
                        {CONNECTION_TIERS.map((t) => (
                            <span key={t.tier} className="text-xs text-muted-foreground">{t.icon}</span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="connections" className="text-xs gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Connect
                    </TabsTrigger>
                    <TabsTrigger value="voting" className="text-xs gap-1">
                        <Vote className="w-3 h-3" />
                        Vote
                    </TabsTrigger>
                    <TabsTrigger value="meetgreet" className="text-xs gap-1">
                        <Video className="w-3 h-3" />
                        Meet & Greet
                    </TabsTrigger>
                </TabsList>

                {/* Artist Connections / DMs */}
                <TabsContent value="connections" className="space-y-4">
                    {!myDay1Artists || myDay1Artists.length === 0 ? (
                        <Card variant="glass" className="text-center py-12">
                            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground font-medium">No connections yet</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Follow and support artists to unlock messaging
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {myDay1Artists.map((day1, index) => {
                                const artist = day1.artist;
                                const canDM = connectionLevel !== 'listener';
                                return (
                                    <motion.div
                                        key={day1.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            variant="glass"
                                            className={`transition-all ${selectedArtist === day1.artist_id
                                                    ? 'border-primary/40'
                                                    : 'hover:border-primary/20'
                                                }`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={artist?.avatar_url || ''} />
                                                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                                                            {(artist?.full_name || '?')[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm truncate">
                                                            {artist?.full_name || 'Unknown'}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            Day 1 supporter since {new Date(day1.followed_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {canDM ? (
                                                        <Button
                                                            size="sm"
                                                            variant={selectedArtist === day1.artist_id ? 'default' : 'outline'}
                                                            className="text-xs"
                                                            onClick={() => setSelectedArtist(
                                                                selectedArtist === day1.artist_id ? null : day1.artist_id
                                                            )}
                                                        >
                                                            <MessageCircle className="w-3 h-3 mr-1" />
                                                            {selectedArtist === day1.artist_id ? 'Close' : 'Message'}
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                                            <Lock className="w-3 h-3 mr-1" />
                                                            Supporter+
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Inline message composer */}
                                                {selectedArtist === day1.artist_id && canDM && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        className="mt-4 pt-4 border-t border-border/50"
                                                    >
                                                        <Textarea
                                                            placeholder={`Send a message to ${artist?.full_name}...`}
                                                            value={messageText}
                                                            onChange={(e) => setMessageText(e.target.value)}
                                                            className="mb-2 min-h-[80px] resize-none"
                                                        />
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-muted-foreground">
                                                                {currentConnectionTier.dmSlots === -1
                                                                    ? 'Unlimited messages'
                                                                    : `${currentConnectionTier.dmSlots} messages remaining this month`}
                                                            </p>
                                                            <Button size="sm" disabled={!messageText.trim()}>
                                                                <Send className="w-3 h-3 mr-1" />
                                                                Send
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Creative Voting */}
                <TabsContent value="voting" className="space-y-4">
                    {currentTier === 'newcomer' ? (
                        <Card variant="glass" className="text-center py-12">
                            <Lock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground font-medium">Voting unlocks at Supporter tier</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Earn 500 MixxCoinz to access creative voting
                            </p>
                        </Card>
                    ) : (
                        activePolls.map((poll, index) => (
                            <motion.div
                                key={poll.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card variant="glass">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">{poll.question}</CardTitle>
                                                <CardDescription className="mt-1">by {poll.artist}</CardDescription>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {poll.endsIn}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {poll.options.map((option) => {
                                            const percentage = Math.round((option.votes / poll.totalVotes) * 100);
                                            return (
                                                <Button
                                                    key={option.id}
                                                    variant="outline"
                                                    className="w-full justify-between h-auto py-3"
                                                >
                                                    <span>{option.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {option.votes} votes
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs">{percentage}%</Badge>
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            {poll.totalVotes.toLocaleString()} total votes
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </TabsContent>

                {/* Meet & Greets */}
                <TabsContent value="meetgreet" className="space-y-4">
                    {meetAndGreets.map((event, index) => {
                        const tierRequired = CONNECTION_TIERS.findIndex(t => t.tier === event.tierRequired);
                        const hasAccess = tierIndex >= tierRequired;

                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card variant="glass" className={`transition-all ${!hasAccess ? 'opacity-60' : ''}`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${event.type === 'video' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                                                }`}>
                                                {event.type === 'video' ? (
                                                    <Video className="w-6 h-6 text-blue-400" />
                                                ) : (
                                                    <Mic className="w-6 h-6 text-purple-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{event.title}</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{event.artist}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {event.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {event.spotsRemaining}/{event.spots} spots
                                                    </span>
                                                </div>
                                            </div>
                                            {hasAccess ? (
                                                <Button size="sm" className="shrink-0">
                                                    RSVP
                                                </Button>
                                            ) : (
                                                <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                                                    <Lock className="w-3 h-3 mr-1" />
                                                    {CONNECTION_TIERS[tierRequired]?.label}+
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </TabsContent>
            </Tabs>
        </div>
    );
};

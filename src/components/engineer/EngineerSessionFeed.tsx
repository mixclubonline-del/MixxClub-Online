/**
 * EngineerSessionFeed — "5 artists need sessions mixed"
 * 
 * This is what an engineer sees when they open MixxClub in the morning.
 * The component that makes them want to check every day.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Headphones, Music, Clock, DollarSign, Send, CheckCircle2,
    Sparkles, Users, Zap, ChevronRight, Filter, Loader2, Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useOpenSessions, useApplyToSession, useSessionMarketplaceStats } from '@/hooks/useSessionMarketplace';
import type { SessionListing, SessionFilters } from '@/hooks/useSessionMarketplace';

const SERVICE_LABELS: Record<string, string> = {
    mixing: 'Mixing',
    mastering: 'Mastering',
    vocal_mixing: 'Vocal Mixing',
    full_production: 'Full Production',
};

const GENRE_OPTIONS = [
    'Hip-Hop', 'R&B', 'Trap', 'Pop', 'Rock', 'Electronic',
    'Jazz', 'Soul', 'Latin', 'Country', 'Indie',
];

export function EngineerSessionFeed() {
    const [filters, setFilters] = useState<SessionFilters>({});
    const { data: sessions, isLoading, error } = useOpenSessions(filters);
    const { data: stats } = useSessionMarketplaceStats();
    const applyMutation = useApplyToSession();

    const handleApply = (sessionId: string) => {
        applyMutation.mutate({ sessionId });
    };

    return (
        <div className="space-y-6">
            {/* Feed Header — The Morning Stat */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <Radio className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-green-500">Live</span>
                        </div>
                        <h2 className="text-2xl font-bold">Session Marketplace</h2>
                    </div>
                    <p className="text-muted-foreground">
                        {stats?.openSessions
                            ? `${stats.openSessions} artist${stats.openSessions !== 1 ? 's' : ''} need${stats.openSessions === 1 ? 's' : ''} sessions mixed`
                            : 'Artists looking for engineers like you'}
                    </p>
                </div>

                {/* Quick stats */}
                {stats && stats.matchedToday > 0 && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                        <Zap className="w-3 h-3" />
                        {stats.matchedToday} matched today
                    </Badge>
                )}
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-3"
            >
                <Select
                    value={filters.serviceType || 'all'}
                    onValueChange={(v) => setFilters(f => ({ ...f, serviceType: v }))}
                >
                    <SelectTrigger className="w-40 bg-card/50 border-border/50">
                        <Headphones className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="mixing">Mixing</SelectItem>
                        <SelectItem value="mastering">Mastering</SelectItem>
                        <SelectItem value="vocal_mixing">Vocal Mixing</SelectItem>
                        <SelectItem value="full_production">Full Production</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.genre || 'all'}
                    onValueChange={(v) => setFilters(f => ({ ...f, genre: v }))}
                >
                    <SelectTrigger className="w-36 bg-card/50 border-border/50">
                        <Music className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {GENRE_OPTIONS.map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </motion.div>

            {/* Sessions Feed */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <Card className="bg-destructive/5 border-destructive/20 p-8 text-center">
                    <p className="text-destructive">Failed to load sessions. Please try again.</p>
                </Card>
            ) : !sessions || sessions.length === 0 ? (
                <Card className="bg-card/50 border-border/30 p-12 text-center">
                    <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No open sessions right now</h3>
                    <p className="text-muted-foreground mb-4">
                        Check back later — artists are posting new sessions every day.
                    </p>
                </Card>
            ) : (
                <AnimatePresence>
                    <div className="grid gap-4">
                        {sessions.map((session, index) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                index={index}
                                onApply={handleApply}
                                isApplying={applyMutation.isPending}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}

// ─── Session Card ────────────────────────────────────────────────

function SessionCard({
    session,
    index,
    onApply,
    isApplying,
}: {
    session: SessionListing;
    index: number;
    onApply: (sessionId: string) => void;
    isApplying: boolean;
}) {
    const genre = session.session_state?.genre;
    const budget = session.session_state?.budget;
    const deadline = session.session_state?.deadline;
    const isUrgent = deadline && new Date(deadline).getTime() - Date.now() < 3 * 86400000; // < 3 days

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="group bg-card/50 border-border/30 hover:border-green-500/40 hover:shadow-[0_0_30px_hsl(142_76%_36%/0.08)] transition-all duration-300 overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Host Avatar */}
                        <Avatar className="w-12 h-12 ring-2 ring-border/50 flex-shrink-0">
                            <AvatarImage src={session.host.avatar_url || undefined} alt={session.host.full_name || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                                {(session.host.full_name || 'A').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Title Row */}
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-lg group-hover:text-green-500 transition-colors truncate">
                                    {session.title}
                                </h3>
                                {isUrgent && (
                                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs gap-0.5">
                                        <Clock className="w-3 h-3" />
                                        Urgent
                                    </Badge>
                                )}
                            </div>

                            {/* Artist name */}
                            <p className="text-sm text-muted-foreground mb-3">
                                by {session.host.full_name || session.host.username || 'Artist'}
                                {session.host.role && (
                                    <span className="ml-1.5 text-xs opacity-60">• {session.host.role}</span>
                                )}
                            </p>

                            {/* Description */}
                            {session.description && (
                                <p className="text-sm text-muted-foreground/80 mb-3 line-clamp-2">
                                    {session.description}
                                </p>
                            )}

                            {/* Meta Tags */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="secondary" className="text-xs gap-1">
                                    <Headphones className="w-3 h-3" />
                                    {SERVICE_LABELS[session.session_type] || session.session_type}
                                </Badge>
                                {genre && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                        <Music className="w-3 h-3" />
                                        {genre}
                                    </Badge>
                                )}
                                {budget && budget > 0 && (
                                    <Badge variant="outline" className="text-xs gap-1 text-green-500 border-green-500/30">
                                        <DollarSign className="w-3 h-3" />
                                        ${budget}
                                    </Badge>
                                )}
                                {session.applicant_count > 0 && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                        <Users className="w-3 h-3" />
                                        {session.applicant_count} applied
                                    </Badge>
                                )}
                            </div>

                            {/* Time */}
                            <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Posted {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                            </p>
                        </div>

                        {/* Action */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            {session.has_applied ? (
                                <Button variant="outline" size="sm" disabled className="gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Applied
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                                    onClick={() => onApply(session.id)}
                                    disabled={isApplying}
                                >
                                    {isApplying ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Apply
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-xs" asChild>
                                <Link to={`/session/${session.id}`}>
                                    Details
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default EngineerSessionFeed;

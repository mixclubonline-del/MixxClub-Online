import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Users, Clock, Music2, Headphones, DollarSign,
  Eye, Zap, Radio, ChevronRight, Filter, Send, CheckCircle2,
  Loader2, Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOpenSessions, useApplyToSession, useSessionMarketplaceStats } from '@/hooks/useSessionMarketplace';
import type { SessionFilters, SessionListing } from '@/hooks/useSessionMarketplace';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileSessionCard } from '@/components/mobile/MobileSessionCard';

const GENRE_OPTIONS = [
  'Hip-Hop', 'R&B', 'Trap', 'Pop', 'Rock', 'Electronic',
  'Jazz', 'Soul', 'Latin', 'Country', 'Indie',
];

const SERVICE_LABELS: Record<string, string> = {
  mixing: 'Mixing',
  mastering: 'Mastering',
  vocal_mixing: 'Vocal Mixing',
  full_production: 'Full Production',
};

export default function SessionsBrowser() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<SessionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Real Supabase queries — no more demo data
  const { data: sessions, isLoading } = useOpenSessions({
    ...filters,
    search: searchQuery || undefined,
  });
  const { data: stats } = useSessionMarketplaceStats();
  const applyMutation = useApplyToSession();

  const isEngineer = user && (user as any).user_metadata?.role === 'engineer';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'waiting': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'matched': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <>
      <Helmet>
        <title>Session Marketplace — MixxClub Online</title>
        <meta
          name="description"
          content="Browse open mixing and mastering sessions. Artists post — engineers apply. Find your next collaboration."
        />
      </Helmet>

      <div className={`min-h-screen bg-background ${isMobile ? 'pb-24' : ''}`}>
        {!isMobile && <GlobalHeader />}

        <main className={`max-w-7xl mx-auto px-4 sm:px-6 ${isMobile ? 'py-4' : 'py-20'}`}>
          {/* Hero — desktop only */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-sm text-green-500 font-medium">
                  {stats?.openSessions
                    ? `${stats.openSessions} Open Session${stats.openSessions !== 1 ? 's' : ''}`
                    : 'Live Sessions'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Session
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-accent-cyan"> Marketplace</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Artists post sessions. Engineers apply. Music gets made.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 gap-2"
              >
                <Link to="/create-session">
                  <Plus className="w-5 h-5" />
                  Post a Session
                </Link>
              </Button>
            </motion.div>
          )}

          {/* Mobile header */}
          {isMobile && (
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Sessions</h1>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-9 gap-1.5"
              >
                <Link to="/create-session">
                  <Plus className="w-4 h-4" />
                  Post
                </Link>
              </Button>
            </div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                className="pl-10 bg-card border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={filters.serviceType || 'all'}
                onValueChange={(v) => setFilters(f => ({ ...f, serviceType: v }))}
              >
                <SelectTrigger className={`${isMobile ? 'w-28' : 'w-40'} bg-card border-border/50`}>
                  <Headphones className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mixing">Mixing</SelectItem>
                  <SelectItem value="mastering">Mastering</SelectItem>
                  <SelectItem value="vocal_mixing">Vocals</SelectItem>
                  <SelectItem value="full_production">Full Prod</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.genre || 'all'}
                onValueChange={(v) => setFilters(f => ({ ...f, genre: v }))}
              >
                <SelectTrigger className={`${isMobile ? 'w-28' : 'w-36'} bg-card border-border/50`}>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {GENRE_OPTIONS.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${sessions?.length || 0} sessions found`}
            </p>
            {stats && stats.matchedToday > 0 && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                <Zap className="w-3 h-3" />
                {stats.matchedToday} matched today
              </Badge>
            )}
          </div>

          {/* Sessions — Mobile vs Desktop */}
          {isLoading ? (
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} gap-${isMobile ? '3' : '6'}`}>
              {[...Array(isMobile ? 3 : 4)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-border/30 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 w-3/4 bg-muted rounded mb-4" />
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <Card className="bg-card/50 border-border/30 p-12 text-center">
              <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filters.genre || filters.serviceType
                  ? 'Try adjusting your filters'
                  : 'Be the first to post a session!'}
              </p>
              <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-600">
                <Link to="/create-session">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Session
                </Link>
              </Button>
            </Card>
          ) : isMobile ? (
            /* ── Mobile: single-column MobileSessionCards ── */
            <div className="space-y-3">
              {sessions.map((session) => (
                <MobileSessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            /* ── Desktop: 2-column detailed cards ── */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {sessions.map((session, index) => {
                const genre = session.session_state?.genre;
                const budget = session.session_state?.budget;
                const deadline = session.session_state?.deadline;
                const isUrgent = deadline && new Date(deadline).getTime() - Date.now() < 3 * 86400000;

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group bg-card/50 border-border/30 hover:border-green-500/50 hover:shadow-[0_0_30px_hsl(142_76%_36%/0.1)] transition-all duration-300 overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={getStatusColor(session.status)}>
                                <Zap className="w-3 h-3 mr-1" />
                                {session.status}
                              </Badge>
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                                {SERVICE_LABELS[session.session_type] || session.session_type}
                              </Badge>
                              {genre && (
                                <Badge variant="outline" className="text-xs">
                                  {genre}
                                </Badge>
                              )}
                              {isUrgent && (
                                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg truncate group-hover:text-green-500 transition-colors">
                              {session.title}
                            </h3>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col">
                        {session.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                          {budget && budget > 0 && (
                            <div className="flex items-center gap-1 text-green-500">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium">${budget}</span>
                            </div>
                          )}
                          {session.applicant_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{session.applicant_count} applied</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={session.host.avatar_url || undefined} alt={session.host.full_name || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent-blue text-white text-xs">
                                {(session.host.full_name || 'A').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{session.host.full_name || session.host.username || 'Artist'}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.has_applied ? (
                              <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                Applied
                              </Badge>
                            ) : user && session.host.id !== user.id ? (
                              <Button
                                size="sm"
                                className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                                onClick={() => applyMutation.mutate({ sessionId: session.id })}
                                disabled={applyMutation.isPending}
                              >
                                {applyMutation.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                Apply
                              </Button>
                            ) : null}
                            <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-400" asChild>
                              <Link to={`/session/${session.id}`}>
                                View
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* CTA — desktop only */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16 text-center"
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-accent-cyan/10 border-green-500/20 p-8">
                <h2 className="text-2xl font-bold mb-3">Need your track mixed?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Post a session and let engineers come to you. Describe your track, set your budget, and find the perfect match.
                </p>
                <Button asChild className="bg-gradient-to-r from-green-500 to-accent-cyan hover:opacity-90">
                  <Link to="/create-session">
                    Post a Session
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </Card>
            </motion.div>
          )}
        </main>

        {/* Mobile Bottom Nav */}
        {isMobile && <MobileBottomNav />}
      </div>
    </>
  );
}

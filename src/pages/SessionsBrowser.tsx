import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Clock, Music2, Headphones, DollarSign, Eye, Zap, Radio, ChevronRight, Filter } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function SessionsBrowser() {
  const { data, isLoading } = useDemoData('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const sessions = data?.sessions || [];

  // Get unique genres
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    sessions.forEach(s => {
      if (s.genre) genres.add(s.genre);
    });
    return Array.from(genres);
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.genre?.toLowerCase().includes(query)
      );
    }

    if (genreFilter && genreFilter !== 'all') {
      result = result.filter(s => s.genre === genreFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }

    return result;
  }, [sessions, searchQuery, genreFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'waiting': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <>
      <Helmet>
        <title>Browse Sessions — MixClub Online</title>
        <meta 
          name="description" 
          content="Discover active collaboration sessions. Join engineers and artists working on tracks right now." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Radio className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm text-green-500 font-medium">Live Sessions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Active
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-accent-cyan"> Collaboration Sessions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join engineers and artists working on tracks right now
            </p>
          </motion.div>

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
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-36 bg-card border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {allGenres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-card border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredSessions.length} sessions found`}
            </p>
          </div>

          {/* Sessions Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-border/30 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 w-3/4 bg-muted rounded mb-4" />
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card className="bg-card/50 border-border/30 p-12 text-center">
              <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </Card>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group bg-card/50 border-border/30 hover:border-green-500/50 hover:shadow-[0_0_30px_hsl(142_76%_36%/0.1)] transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(session.status)}>
                              {session.status === 'active' && <Zap className="w-3 h-3 mr-1" />}
                              {session.status}
                            </Badge>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                              {session.genre}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg truncate group-hover:text-green-500 transition-colors">
                            {session.title}
                          </h3>
                        </div>
                        {session.visibility === 'public' && (
                          <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {session.description}
                      </p>

                      {/* Session Meta */}
                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Music2 className="w-4 h-4" />
                          <span>{session.session_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Headphones className="w-4 h-4" />
                          <span>{session.audio_quality}</span>
                        </div>
                        {session.budget_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{session.budget_range}</span>
                          </div>
                        )}
                      </div>

                      {/* Host & Time */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={session.host?.avatar} alt={session.host?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent-blue text-white text-xs">
                              {session.host?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{session.host?.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.created_at ? formatDistanceToNow(new Date(session.created_at), { addSuffix: true }) : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-400" asChild>
                          <Link to={`/session/${session.id}`}>
                            Join Session
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-accent-cyan/10 border-green-500/20 p-8">
              <h2 className="text-2xl font-bold mb-3">Ready to collaborate?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your own session and invite engineers to work on your track.
              </p>
              <Button asChild className="bg-gradient-to-r from-green-500 to-accent-cyan hover:opacity-90">
                <Link to="/create-session">
                  Start a Session
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </Card>
          </motion.div>
        </main>
      </div>
    </>
  );
}

import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Music, DollarSign, Clock, CheckCircle, Users, Zap, Filter, ChevronRight, Headphones } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';
import { motion } from 'framer-motion';

export default function EngineerDirectory() {
  const { data, isLoading } = useDemoData('engineers');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const engineers = data?.engineers || [];

  // Get unique genres from all engineers
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    engineers.forEach(eng => {
      eng.genres?.forEach((g: string) => genres.add(g));
    });
    return Array.from(genres);
  }, [engineers]);

  // Filter and sort engineers
  const filteredEngineers = useMemo(() => {
    let result = [...engineers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(eng => 
        eng.full_name?.toLowerCase().includes(query) ||
        eng.specialties?.some((s: string) => s.toLowerCase().includes(query)) ||
        eng.genres?.some((g: string) => g.toLowerCase().includes(query))
      );
    }

    // Genre filter
    if (genreFilter && genreFilter !== 'all') {
      result = result.filter(eng => eng.genres?.includes(genreFilter));
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'rate-low':
        result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
        break;
      case 'rate-high':
        result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
        break;
      case 'projects':
        result.sort((a, b) => (b.completed_projects || 0) - (a.completed_projects || 0));
        break;
    }

    return result;
  }, [engineers, searchQuery, genreFilter, sortBy]);

  return (
    <>
      <Helmet>
        <title>Find Engineers — Mixxclub Online</title>
        <meta 
          name="description" 
          content="Discover professional audio engineers for mixing, mastering, and production. Browse by genre, rate, and rating." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Headphones className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Professional Engineers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue"> Engineer Match</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with verified professionals who specialize in your genre
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, specialty, or genre..."
                className="pl-10 bg-card border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-40 bg-card border-border/50">
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-card border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="rate-low">Price: Low to High</SelectItem>
                  <SelectItem value="rate-high">Price: High to Low</SelectItem>
                  <SelectItem value="projects">Most Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredEngineers.length} engineers available`}
            </p>
          </div>

          {/* Engineers Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-border/30 animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-muted rounded mb-2" />
                        <div className="h-4 w-24 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEngineers.length === 0 ? (
            <Card className="bg-card/50 border-border/30 p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No engineers found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </Card>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEngineers.map((engineer, index) => (
                <motion.div
                  key={engineer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group bg-card/50 border-border/30 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-16 h-16 ring-2 ring-border group-hover:ring-primary/50 transition-colors">
                          <AvatarImage src={engineer.avatar_url} alt={engineer.full_name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent-blue text-white text-lg font-bold">
                            {engineer.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{engineer.full_name}</h3>
                            {engineer.level >= 3 && (
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium">{engineer.rating?.toFixed(1)}</span>
                            <span className="text-muted-foreground">({engineer.completed_projects} projects)</span>
                          </div>
                        </div>
                      </div>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {engineer.genres?.slice(0, 3).map((genre: string) => (
                          <Badge key={genre} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                            {genre}
                          </Badge>
                        ))}
                        {engineer.genres?.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
                            +{engineer.genres.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Specialties */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {engineer.specialties?.join(' • ')}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-border/30">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <DollarSign className="w-3 h-3" />
                          </div>
                          <p className="font-semibold text-sm">${engineer.hourly_rate}/hr</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Music className="w-3 h-3" />
                          </div>
                          <p className="font-semibold text-sm">{engineer.completed_projects} done</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                          </div>
                          <p className="font-semibold text-sm">{engineer.years_experience}y exp</p>
                        </div>
                      </div>

                      {/* Availability Badge */}
                      <div className="flex items-center justify-between">
                        {engineer.availability_status === 'available' ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Zap className="w-3 h-3 mr-1" />
                            Available Now
                          </Badge>
                        ) : engineer.availability_status === 'busy' ? (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            Limited Availability
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground">
                            Unavailable
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary" asChild>
                          <Link to={`/engineer/${engineer.id}`}>
                            View Profile
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

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-accent-blue/10 border-primary/20 p-8">
              <h2 className="text-2xl font-bold mb-3">Are you an engineer?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Join Mixxclub and start earning from your studio. Get matched with artists who need your skills.
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent-blue hover:opacity-90">
                <Link to="/auth?role=engineer">
                  Apply to Join
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

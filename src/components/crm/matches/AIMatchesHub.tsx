import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, Loader2, Heart, MessageCircle, Sparkles, RefreshCw, 
  Search, Filter, Users, Zap, Target, TrendingUp, Music,
  CheckCircle, Clock, Award, ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MatchCard } from './MatchCard';
import { MatchFilters } from './MatchFilters';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';

export interface MatchProfile {
  id: string;
  matchedUserId: string;
  name: string;
  avatarUrl?: string;
  userType: 'artist' | 'engineer';
  specialties: string[];
  genres: string[];
  experience: number;
  rating: number;
  completedProjects: number;
  hourlyRate?: number;
  matchScore: number;
  compatibilityScores: {
    genre: number;
    style: number;
    technical: number;
    availability: number;
  };
  matchReason?: string;
  aiInsight?: string;
  saved: boolean;
  status: 'pending' | 'contacted' | 'working' | 'completed';
  lastActive?: Date;
  createdAt: Date;
}

interface AIMatchesHubProps {
  userType: 'artist' | 'engineer';
}

export const AIMatchesHub = ({ userType }: AIMatchesHubProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    minScore: 0,
    genres: [] as string[],
    specialties: [] as string[],
    minRating: 0,
    maxRate: 1000,
  });

  const loadMatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch matches from database
      const { data: matchData, error } = await supabase
        .from('user_matches')
        .select('*')
        .eq('user_id', user.id)
        .order('match_score', { ascending: false });

      if (error) throw error;

      if (matchData && matchData.length > 0) {
        const matchedUserIds = matchData.map(m => m.matched_user_id);
        
        // Fetch profile data for matched users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .in('id', matchedUserIds);

        // Fetch engineer profiles if artist, or artist data if engineer
        const { data: engineerProfiles } = await supabase
          .from('engineer_profiles')
          .select('*')
          .in('user_id', matchedUserIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const engineerMap = new Map(engineerProfiles?.map(e => [e.user_id, e]) || []);

        const formattedMatches: MatchProfile[] = matchData.map(match => {
          const profile = profileMap.get(match.matched_user_id);
          const engineerProfile = engineerMap.get(match.matched_user_id);
          
          // Parse match criteria for compatibility scores
          const criteria = (match.match_criteria && typeof match.match_criteria === 'object' && !Array.isArray(match.match_criteria)) 
            ? match.match_criteria as Record<string, number>
            : {};
          
          const baseScore = match.match_score || 0;
          const status = (['pending', 'contacted', 'working', 'completed'].includes(match.status || '') 
            ? match.status 
            : 'pending') as 'pending' | 'contacted' | 'working' | 'completed';
          
          return {
            id: match.id,
            matchedUserId: match.matched_user_id,
            name: profile?.full_name || 'Unknown User',
            avatarUrl: profile?.avatar_url,
            userType: userType === 'artist' ? 'engineer' : 'artist',
            specialties: Array.isArray(engineerProfile?.specialties) ? engineerProfile.specialties : [],
            genres: Array.isArray(engineerProfile?.genres) ? engineerProfile.genres : [],
            experience: engineerProfile?.years_experience || 0,
            rating: engineerProfile?.rating || 4.5,
            completedProjects: engineerProfile?.completed_projects || 0,
            hourlyRate: engineerProfile?.hourly_rate,
            matchScore: baseScore,
            compatibilityScores: {
              genre: (criteria.genre_score as number) || Math.round(baseScore * 0.9),
              style: (criteria.style_score as number) || Math.round(baseScore * 0.85),
              technical: (criteria.technical_score as number) || Math.round(baseScore * 0.95),
              availability: (criteria.availability_score as number) || 85,
            },
            matchReason: match.match_reason,
            aiInsight: match.ai_explanation,
            saved: match.saved || false,
            status,
            lastActive: match.updated_at ? new Date(match.updated_at) : undefined,
            createdAt: new Date(match.created_at),
          };
        });

        setMatches(formattedMatches);
      } else {
        // No matches found - show empty state (no fake data)
        setMatches([]);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      // Show empty state on error - don't use fake data
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [user, userType]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Dead code removed: generateSampleMatches() was deprecated
  // Matches now come exclusively from database via loadMatches()

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Call edge function to refresh matches
      const { data: session } = await supabase.auth.getSession();
      
      await supabase.functions.invoke('match-engineers', {
        body: { refresh: true },
        headers: session?.session ? { Authorization: `Bearer ${session.session.access_token}` } : {},
      });

      await loadMatches();
      toast.success('Matches refreshed!');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh matches');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveMatch = async (matchId: string, currentSaved: boolean) => {
    try {
      const { error } = await supabase
        .from('user_matches')
        .update({ saved: !currentSaved })
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.map(m => 
        m.id === matchId ? { ...m, saved: !currentSaved } : m
      ));

      toast.success(currentSaved ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error saving match:', error);
      // Update locally anyway for demo
      setMatches(prev => prev.map(m => 
        m.id === matchId ? { ...m, saved: !currentSaved } : m
      ));
    }
  };

  const handleContactMatch = async (match: MatchProfile) => {
    try {
      await supabase
        .from('user_matches')
        .update({ status: 'contacted', contacted_at: new Date().toISOString() })
        .eq('id', match.id);

      setMatches(prev => prev.map(m => 
        m.id === match.id ? { ...m, status: 'contacted' } : m
      ));

      navigate(`/${userType}-crm?tab=messages&contact=${match.matchedUserId}`);
    } catch (error) {
      console.error('Error contacting match:', error);
    }
  };

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!match.name.toLowerCase().includes(query) &&
          !match.specialties.some(s => s.toLowerCase().includes(query)) &&
          !match.genres.some(g => g.toLowerCase().includes(query))) {
        return false;
      }
    }
    if (filters.minScore > 0 && match.matchScore < filters.minScore) return false;
    if (filters.minRating > 0 && match.rating < filters.minRating) return false;
    if (filters.maxRate < 1000 && (match.hourlyRate || 0) > filters.maxRate) return false;
    if (filters.genres.length > 0 && !filters.genres.some(g => match.genres.includes(g))) return false;
    if (filters.specialties.length > 0 && !filters.specialties.some(s => match.specialties.includes(s))) return false;
    return true;
  });

  // Tab-based filtering
  const displayMatches = activeTab === 'saved' 
    ? filteredMatches.filter(m => m.saved)
    : activeTab === 'contacted'
    ? filteredMatches.filter(m => m.status === 'contacted' || m.status === 'working')
    : filteredMatches;

  const stats = {
    total: matches.length,
    saved: matches.filter(m => m.saved).length,
    contacted: matches.filter(m => m.status === 'contacted').length,
    avgScore: matches.length > 0 
      ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) 
      : 0,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Finding your perfect matches...</p>
        <p className="text-sm text-muted-foreground mt-2">Our AI is analyzing compatibility...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI Matches Hub
          </h2>
          <p className="text-muted-foreground mt-1">
            {userType === 'artist' ? 'Engineers matched to your sound' : 'Artists looking for your expertise'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh Matches
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "border-primary")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Matches</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.saved}</p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.contacted}</p>
              <p className="text-xs text-muted-foreground">Contacted</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
              <p className="text-xs text-muted-foreground">Avg. Match</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${userType === 'artist' ? 'engineers' : 'artists'} by name, specialty, or genre...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MatchFilters 
                filters={filters} 
                onChange={setFilters}
                userType={userType}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="gap-2">
            <Users className="w-4 h-4" />
            All ({filteredMatches.length})
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="w-4 h-4" />
            Saved ({stats.saved})
          </TabsTrigger>
          <TabsTrigger value="contacted" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Active ({stats.contacted})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Match List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {displayMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'saved' 
                    ? "You haven't saved any matches yet"
                    : activeTab === 'contacted'
                    ? "No active conversations"
                    : "Try adjusting your filters or refresh matches"}
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Find New Matches
                </Button>
              </Card>
            </motion.div>
          ) : (
            displayMatches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MatchCard
                  match={match}
                  userType={userType}
                  onSave={() => handleSaveMatch(match.id, match.saved)}
                  onContact={() => handleContactMatch(match)}
                  onSelect={() => setSelectedMatch(match)}
                  isSelected={selectedMatch?.id === match.id}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Compatibility Breakdown Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <CompatibilityBreakdown
            match={selectedMatch}
            userType={userType}
            onClose={() => setSelectedMatch(null)}
            onContact={() => handleContactMatch(selectedMatch)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

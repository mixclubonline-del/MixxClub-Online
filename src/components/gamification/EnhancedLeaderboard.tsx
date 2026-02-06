import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Search,
  Crown,
  Medal,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar_url?: string;
  rating: number;
  projects: number;
  earnings: number;
  badges: string[];
  rankChange?: number;
}

export const EnhancedLeaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'engineers' | 'artists' | 'overall'>('engineers');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch from engineer_leaderboard view
      const { data: leaderboardData, error } = await supabase
        .from('engineer_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;

      const engineerIds = (leaderboardData || []).map(e => e.engineer_id);
      
      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', engineerIds);

      // Fetch achievements/badges
      const { data: achievements } = await supabase
        .from('achievements')
        .select('user_id, badge_name')
        .in('user_id', engineerIds);

      // Transform data without Math.random() - rank change requires historical tracking
      const enrichedData: LeaderboardEntry[] = (leaderboardData || []).map((entry, index) => {
        const profile = profiles?.find(p => p.id === entry.engineer_id);
        const userBadges = achievements
          ?.filter(a => a.user_id === entry.engineer_id)
          .map(a => a.badge_name)
          .filter(Boolean) as string[];

        return {
          id: entry.engineer_id,
          rank: entry.rank || index + 1,
          name: profile?.username || 'Anonymous',
          avatar_url: profile?.avatar_url,
          rating: entry.average_rating || 0,
          projects: entry.completed_projects || 0,
          earnings: entry.total_earnings || 0,
          badges: userBadges?.slice(0, 3) || [],
          rankChange: 0 // Rank change requires historical snapshots - show 0 for now
        };
      });

      setEntries(enrichedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground w-6 text-center">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 via-gray-500/10 to-transparent border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 via-orange-500/10 to-transparent border-amber-600/30';
      default: return 'bg-card hover:bg-accent/50';
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Leaderboard
            </CardTitle>
            <CardDescription>Top performers in our community</CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            
            <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <TabsList>
                <TabsTrigger value="engineers" className="gap-1">
                  <Users className="h-4 w-4" />
                  Engineers
                </TabsTrigger>
                <TabsTrigger value="artists" className="gap-1">
                  <Star className="h-4 w-4" />
                  Artists
                </TabsTrigger>
                <TabsTrigger value="overall" className="gap-1">
                  <Trophy className="h-4 w-4" />
                  Overall
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No results found</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${getRankBg(entry.rank)} ${
                    entry.id === user?.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={entry.avatar_url || ''} />
                      <AvatarFallback>
                        {entry.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{entry.name}</p>
                        {entry.id === user?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                        {entry.rankChange !== 0 && (
                          <span className={`flex items-center text-xs ${
                            entry.rankChange && entry.rankChange > 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            <TrendingUp className={`h-3 w-3 ${
                              entry.rankChange && entry.rankChange < 0 ? 'rotate-180' : ''
                            }`} />
                            {Math.abs(entry.rankChange || 0)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span>{entry.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {entry.projects} projects
                        </span>
                        
                        {entry.badges.length > 0 && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex gap-1">
                              {entry.badges.map((badge, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="text-xs px-1.5 py-0"
                                >
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-500">
                      ${entry.earnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">total earned</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

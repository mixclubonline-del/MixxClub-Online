import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Vote, Music, Flame, Star, TrendingUp } from 'lucide-react';

interface FanStats {
  total_votes: number;
  total_comments: number;
  total_premieres_attended: number;
}

interface VotingHistory {
  id: string;
  premiere_id: string;
  vote_type: string;
  created_at: string;
  premiere?: {
    title: string;
    artwork_url: string;
    genre: string;
  };
}

export default function FanDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FanStats | null>(null);
  const [votingHistory, setVotingHistory] = useState<VotingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFanData();
    }
  }, [user]);

  const fetchFanData = async () => {
    if (!user) return;

    try {
      // Fetch fan stats
      const { data: fanStats } = await supabase
        .from('fan_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fanStats) {
        setStats(fanStats);
      } else {
        // Create default stats if none exist
        setStats({ total_votes: 0, total_comments: 0, total_premieres_attended: 0 });
      }

      // Fetch voting history
      const { data: votes } = await supabase
        .from('premiere_votes')
        .select(`
          id,
          premiere_id,
          vote_type,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (votes) {
        setVotingHistory(votes);
      }
    } catch (error) {
      console.error('Error fetching fan data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate fan level based on engagement
  const calculateFanLevel = (stats: FanStats | null) => {
    if (!stats) return { level: 1, title: 'Newcomer', progress: 0, xp: 0, nextLevelXp: 100 };
    
    const xp = (stats.total_votes * 10) + (stats.total_comments * 5) + (stats.total_premieres_attended * 25);
    const levels = [
      { level: 1, title: 'Newcomer', xpRequired: 0 },
      { level: 2, title: 'Listener', xpRequired: 100 },
      { level: 3, title: 'Fan', xpRequired: 250 },
      { level: 4, title: 'Superfan', xpRequired: 500 },
      { level: 5, title: 'Tastemaker', xpRequired: 1000 },
      { level: 6, title: 'Trendsetter', xpRequired: 2000 },
      { level: 7, title: 'Influencer', xpRequired: 5000 },
      { level: 8, title: 'Legend', xpRequired: 10000 },
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].xpRequired) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || levels[i];
        break;
      }
    }

    const progress = nextLevel.xpRequired > currentLevel.xpRequired
      ? ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
      : 100;

    return { 
      level: currentLevel.level, 
      title: currentLevel.title, 
      progress, 
      xp,
      nextLevelXp: nextLevel.xpRequired 
    };
  };

  const fanLevel = calculateFanLevel(stats);

  if (!user) {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardContent className="p-6 text-center">
          <Music className="w-12 h-12 mx-auto text-primary/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Join the Crowd</h3>
          <p className="text-muted-foreground">
            Sign in to track your voting history, earn XP, and unlock exclusive fan badges.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur animate-pulse">
        <CardContent className="p-6 h-48" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fan Level Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Fan Dashboard
            </span>
            <Badge variant="secondary" className="bg-primary/20">
              Level {fanLevel.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Level Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-primary">{fanLevel.title}</span>
                <span className="text-muted-foreground">{fanLevel.xp} / {fanLevel.nextLevelXp} XP</span>
              </div>
              <Progress value={fanLevel.progress} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 rounded-lg bg-background/50">
                <Vote className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <p className="text-2xl font-bold">{stats?.total_votes || 0}</p>
                <p className="text-xs text-muted-foreground">Votes Cast</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <Music className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-2xl font-bold">{stats?.total_premieres_attended || 0}</p>
                <p className="text-xs text-muted-foreground">Premieres</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <p className="text-2xl font-bold">{stats?.total_comments || 0}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Voting Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {votingHistory.length > 0 ? (
            <div className="space-y-2">
              {votingHistory.slice(0, 5).map((vote) => (
                <div 
                  key={vote.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-background/30"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Premiere Vote</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(vote.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Vote className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No voting activity yet</p>
              <p className="text-xs">Vote on premieres to earn XP!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fan Badges Preview */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Fan Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats && stats.total_votes >= 1 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                🎯 First Vote
              </Badge>
            )}
            {stats && stats.total_votes >= 10 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                🔥 Active Voter
              </Badge>
            )}
            {stats && stats.total_premieres_attended >= 5 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                🎵 Premiere Regular
              </Badge>
            )}
            {stats && stats.total_votes >= 50 && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                ⭐ Tastemaker
              </Badge>
            )}
            {(!stats || (stats.total_votes < 1 && stats.total_premieres_attended < 1)) && (
              <p className="text-xs text-muted-foreground">
                Earn badges by voting and attending premieres!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

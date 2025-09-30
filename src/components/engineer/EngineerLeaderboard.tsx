import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  engineer_id: string;
  total_earnings: number;
  completed_projects: number;
  average_rating: number;
  rank: number;
  profile: {
    full_name: string | null;
    email: string;
  } | null;
}

export function EngineerLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('engineer_leaderboard')
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top performing engineers this month</CardDescription>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No leaderboard data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader) => (
              <div
                key={leader.engineer_id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className={`w-8 text-center font-bold text-xl ${getRankColor(leader.rank)}`}>
                  {leader.rank <= 3 ? (
                    <Trophy className="w-6 h-6 inline" />
                  ) : (
                    `#${leader.rank}`
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {leader.profile?.full_name || leader.profile?.email || 'Anonymous'}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      ${leader.total_earnings.toFixed(0)}
                    </span>
                    <span>{leader.completed_projects} projects</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {leader.average_rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {leader.rank <= 3 && (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    Top {leader.rank}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

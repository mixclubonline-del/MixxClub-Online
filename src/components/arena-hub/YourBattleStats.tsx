import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Trophy, Flame } from 'lucide-react';

export default function YourBattleStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-battle-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: votes, error } = await supabase
        .from('battle_votes')
        .select('*, battles(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalVotes = votes?.length || 0;
      const winningVotes = votes?.filter(v => v.winner)?.length || 0;
      const accuracy = totalVotes > 0 ? (winningVotes / totalVotes * 100).toFixed(1) : 0;

      return {
        totalVotes,
        winningVotes,
        accuracy,
        recentActivity: votes?.slice(0, 3) || [],
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground">Login to view your battle stats</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card/30 to-accent-cyan/10 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Your Battle Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-2xl font-bold">{stats.totalVotes}</p>
            </div>
            <p className="text-xs text-muted-foreground">Total Votes</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <p className="text-2xl font-bold">{stats.winningVotes}</p>
            </div>
            <p className="text-xs text-muted-foreground">Winners Picked</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
            </div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {stats.recentActivity.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Votes</p>
            {stats.recentActivity.map((vote: any) => (
              <div key={vote.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <span className="text-sm truncate">{vote.battles?.title || 'Battle'}</span>
                <Badge variant="outline" className="text-xs">
                  {vote.winner}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

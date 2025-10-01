import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, DollarSign, Star, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  id: string;
  engineer_id: string;
  rank: number;
  total_earnings: number;
  completed_projects: number;
  average_rating: number;
  leaderboard_type: string;
  engineer: {
    full_name: string;
  };
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

export const EnhancedLeaderboard = () => {
  const [period, setPeriod] = useState<TimePeriod>('all_time');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('engineer_leaderboard')
      .select(`
        *,
        engineer:profiles!engineer_leaderboard_engineer_id_fkey(full_name)
      `)
      .eq('leaderboard_type', period)
      .order('rank', { ascending: true })
      .limit(10);

    if (!error && data) {
      setLeaders(data as any);
    }
    setLoading(false);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-br from-amber-600 to-amber-800";
    return "bg-muted";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Leaderboard
        </h3>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all_time">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-3">
          {loading ? (
            <div className="text-center py-8">Loading leaderboard...</div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No data yet for this period</p>
            </div>
          ) : (
            leaders.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                  entry.rank <= 3 ? 'bg-muted/50' : ''
                }`}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankColor(entry.rank)}`}>
                  {getRankBadge(entry.rank)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {entry.engineer?.full_name?.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h4 className="font-semibold">{entry.engineer?.full_name || 'Engineer'}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {entry.total_earnings.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {entry.completed_projects} projects
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {entry.average_rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {entry.rank <= 3 && (
                  <Badge variant="secondary" className="font-bold">
                    Top {entry.rank}
                  </Badge>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

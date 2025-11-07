import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, Star, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardPremiere {
  id: string;
  title: string;
  artist_id: string;
  total_votes: number;
  average_rating: number;
  play_count: number;
  trending_score: number;
  weekly_rank: number | null;
  monthly_rank: number | null;
  premiere_date: string;
  artist_profile: {
    display_name: string;
    avatar_url: string;
  };
}

export default function LeaderboardView() {
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardPremiere[]>([]);
  const [monthlyLeaders, setMonthlyLeaders] = useState<LeaderboardPremiere[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setIsLoading(true);

    // Fetch weekly leaderboard
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: weekly } = await supabase
      .from('premieres')
      .select(`
        id,
        title,
        artist_id,
        total_votes,
        average_rating,
        play_count,
        trending_score,
        weekly_rank,
        monthly_rank,
        premiere_date,
        artist_profile:profiles!premieres_artist_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'live')
      .gte('premiere_date', sevenDaysAgo.toISOString())
      .order('trending_score', { ascending: false })
      .limit(10);

    // Fetch monthly leaderboard
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthly } = await supabase
      .from('premieres')
      .select(`
        id,
        title,
        artist_id,
        total_votes,
        average_rating,
        play_count,
        trending_score,
        weekly_rank,
        monthly_rank,
        premiere_date,
        artist_profile:profiles!premieres_artist_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'live')
      .gte('premiere_date', thirtyDaysAgo.toISOString())
      .order('trending_score', { ascending: false })
      .limit(10);

    setWeeklyLeaders((weekly as any) || []);
    setMonthlyLeaders((monthly as any) || []);
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-xl font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          🏆 1st Place
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">
          🥈 2nd Place
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0">
          🥉 3rd Place
        </Badge>
      );
    }
    return null;
  };

  const renderLeaderboardItem = (premiere: LeaderboardPremiere, rank: number) => {
    const artistProfile = Array.isArray(premiere.artist_profile) 
      ? premiere.artist_profile[0] 
      : premiere.artist_profile;

    return (
      <Card
        key={premiere.id}
        className={`p-4 mb-3 bg-card/30 backdrop-blur-sm border-white/10 hover:border-accent/30 transition-all ${
          rank <= 3 ? 'border-2 border-accent/50 shadow-lg shadow-accent/20' : ''
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            {getRankIcon(rank)}
          </div>

          <Avatar className="h-14 w-14">
            <AvatarImage src={artistProfile?.avatar_url} />
            <AvatarFallback>{artistProfile?.display_name?.[0] || 'A'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-lg font-semibold truncate">{premiere.title}</h4>
              {getRankBadge(rank)}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              by {artistProfile?.display_name || 'Unknown Artist'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-lg font-bold">
                    {premiere.trending_score.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Trending</span>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">
                    {premiere.average_rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {premiere.total_votes} votes
                </span>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  <span className="text-sm font-medium">{premiere.play_count}</span>
                </div>
                <span className="text-xs text-muted-foreground">plays</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse bg-card/30">
            <div className="h-16 bg-muted/20 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-blue bg-clip-text text-transparent">
            🏆 Leaderboards
          </h2>
          <p className="text-muted-foreground mt-1">
            Top-voted tracks competing for prizes and recognition
          </p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent-blue/10 border-accent/20">
        <div className="flex items-start gap-4">
          <Trophy className="h-12 w-12 text-accent flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Prizes & Rewards</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🥇 <strong>Weekly Winner:</strong> Featured on homepage + $100 distribution credit</p>
              <p>🏅 <strong>Top 3 Weekly:</strong> Premium analytics dashboard access for 1 month</p>
              <p>🎯 <strong>Monthly Winner:</strong> Featured playlist placement + $500 distribution credit</p>
              <p>⭐ <strong>Top 10 Monthly:</strong> Exclusive "Chart Topper" badge + priority support</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="weekly" className="text-lg">
            📅 Weekly Leaders
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-lg">
            📆 Monthly Leaders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          {weeklyLeaders.length === 0 ? (
            <Card className="p-8 text-center bg-card/30">
              <p className="text-muted-foreground">
                No premieres this week yet. Be the first!
              </p>
            </Card>
          ) : (
            weeklyLeaders.map((premiere, index) =>
              renderLeaderboardItem(premiere, index + 1)
            )
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {monthlyLeaders.length === 0 ? (
            <Card className="p-8 text-center bg-card/30">
              <p className="text-muted-foreground">
                No premieres this month yet. Be the first!
              </p>
            </Card>
          ) : (
            monthlyLeaders.map((premiere, index) =>
              renderLeaderboardItem(premiere, index + 1)
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

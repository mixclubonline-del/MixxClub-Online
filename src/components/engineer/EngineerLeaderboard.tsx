import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Trophy, 
  Star, 
  TrendingUp,
  Medal,
  Crown
} from 'lucide-react';

interface LeaderboardEntry {
  engineer_id: string;
  rank: number;
  average_rating: number;
  completed_projects: number;
  total_earnings: number;
  engineer_name?: string;
  avatar_url?: string;
}

export function EngineerLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'monthly' | 'weekly'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('engineer_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;

      // Fetch profile info for each engineer
      const engineerIds = (data || []).map(e => e.engineer_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', engineerIds);

      const enrichedData = (data || []).map(entry => {
        const profile = profiles?.find(p => p.id === entry.engineer_id);
        return {
          ...entry,
          engineer_name: profile?.username || 'Anonymous',
          avatar_url: profile?.avatar_url
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
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
      default: return 'bg-card';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Engineers
        </CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs">All Time</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No leaderboard data yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.engineer_id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm ${getRankBg(entry.rank)} ${
                    entry.engineer_id === user?.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar_url || ''} />
                      <AvatarFallback>
                        {entry.engineer_name?.charAt(0).toUpperCase() || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {entry.engineer_name}
                        {entry.engineer_id === user?.id && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>{entry.average_rating?.toFixed(1) || '0.0'}</span>
                        <span>•</span>
                        <span>{entry.completed_projects || 0} projects</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500">
                      ${(entry.total_earnings || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

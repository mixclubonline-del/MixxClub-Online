import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Star, ArrowRight, Crown, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LeaderboardEntry {
  engineer_id: string;
  rank: number;
  average_rating: number;
  completed_projects: number;
  engineer_name?: string;
  avatar_url?: string;
}

export default function TopEngineersLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopEngineers();
  }, []);

  const fetchTopEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineer_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(5);

      if (error) throw error;

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
      case 1: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-400" />;
      case 3: return <Medal className="h-4 w-4 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Top Engineers
          </span>
          <Link to="/leaderboard">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No leaderboard data yet
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.engineer_id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {entry.engineer_name?.charAt(0).toUpperCase() || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{entry.engineer_name}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span>{entry.average_rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

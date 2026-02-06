import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Swords, Trophy, Activity } from 'lucide-react';
import { format } from 'date-fns';

export const AdminCommunityHub = () => {
  const [activity, setActivity] = useState<any[]>([]);
  const [battles, setBattles] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      const [{ data: activityData }, { data: battlesData }, { data: achievementsData }] = await Promise.all([
        supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('battles').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('achievements').select('*').order('earned_at', { ascending: false }).limit(15),
      ]);

      setActivity(activityData || []);
      setBattles(battlesData || []);
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Failed to fetch community data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Activity className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activity.length}</p>
              <p className="text-xs text-muted-foreground">Recent Activity</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><Swords className="w-5 h-5 text-red-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{battles.length}</p>
              <p className="text-xs text-muted-foreground">Battles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Trophy className="w-5 h-5 text-yellow-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-4 h-4" /> Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.activity_type}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Battles */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Swords className="w-4 h-4" /> Battles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {battles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No battles created</p>
            ) : (
              battles.map((battle) => (
                <div key={battle.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{battle.title}</p>
                    <Badge variant="outline" className="text-xs capitalize mt-1">{battle.status || 'pending'}</Badge>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{battle.votes_count || 0} votes</p>
                    <p>{format(new Date(battle.created_at), 'MMM d')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

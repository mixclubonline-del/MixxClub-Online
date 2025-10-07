import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Music, TrendingUp, Clock } from 'lucide-react';

export default function ArtistStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['artist-stats'],
    queryFn: async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [artistsCount, tracksThisWeek, totalProjects, avgCompletionTime] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('audio_files')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo),
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase
          .from('projects')
          .select('created_at, updated_at')
          .eq('status', 'completed')
          .limit(100)
      ]);

      let avgDays = 0;
      if (avgCompletionTime.data && avgCompletionTime.data.length > 0) {
        const durations = avgCompletionTime.data.map(p => {
          const start = new Date(p.created_at).getTime();
          const end = new Date(p.updated_at).getTime();
          return (end - start) / (1000 * 60 * 60 * 24);
        });
        avgDays = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
      }

      return {
        totalArtists: artistsCount.count || 0,
        tracksThisWeek: tracksThisWeek.count || 0,
        completedProjects: totalProjects.count || 0,
        avgCompletionDays: avgDays
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4 text-center">
              <Skeleton className="w-10 h-10 rounded-full mx-auto mb-3" />
              <Skeleton className="h-6 w-16 mx-auto mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      value: stats?.totalArtists.toLocaleString() || '0',
      label: 'Active Artists',
      color: 'text-primary'
    },
    {
      icon: Music,
      value: stats?.tracksThisWeek.toLocaleString() || '0',
      label: 'Tracks This Week',
      color: 'text-accent-cyan'
    },
    {
      icon: TrendingUp,
      value: stats?.completedProjects.toLocaleString() || '0',
      label: 'Completed Projects',
      color: 'text-accent-blue'
    },
    {
      icon: Clock,
      value: `${stats?.avgCompletionDays || 0}d`,
      label: 'Avg. Completion',
      color: 'text-primary'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, i) => (
        <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
          <CardContent className="p-4 text-center">
            <stat.icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

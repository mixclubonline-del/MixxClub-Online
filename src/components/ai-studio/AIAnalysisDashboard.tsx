import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Zap, TrendingUp, BarChart3 } from 'lucide-react';

export default function AIAnalysisDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['ai-analysis-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [tracksToday, avgProcessingTime, genres, recentProfiles] = await Promise.all([
        supabase
          .from('ai_audio_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from('ai_audio_profiles')
          .select('processing_time_ms')
          .not('processing_time_ms', 'is', null)
          .limit(100),
        supabase
          .from('ai_audio_profiles')
          .select('genre_prediction')
          .not('genre_prediction', 'is', null)
          .limit(200),
        supabase
          .from('ai_audio_profiles')
          .select('loudness_lufs, dynamic_range')
          .not('loudness_lufs', 'is', null)
          .limit(100)
      ]);

      const avgTime = avgProcessingTime.data && avgProcessingTime.data.length > 0
        ? Math.round(avgProcessingTime.data.reduce((sum, p) => sum + (p.processing_time_ms || 0), 0) / avgProcessingTime.data.length / 1000)
        : 0;

      const genreCount: Record<string, number> = {};
      genres.data?.forEach(item => {
        if (item.genre_prediction && typeof item.genre_prediction === 'object') {
          const topGenre = Object.keys(item.genre_prediction)[0];
          if (topGenre) genreCount[topGenre] = (genreCount[topGenre] || 0) + 1;
        }
      });
      const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

      const qualityDistribution = {
        high: 0,
        medium: 0,
        low: 0
      };
      recentProfiles.data?.forEach(profile => {
        const lufs = profile.loudness_lufs || 0;
        if (Math.abs(lufs) >= 14 && Math.abs(lufs) <= 18) qualityDistribution.high++;
        else if (Math.abs(lufs) >= 10) qualityDistribution.medium++;
        else qualityDistribution.low++;
      });

      return {
        tracksAnalyzedToday: tracksToday.count || 0,
        avgProcessingTimeSec: avgTime,
        topGenre,
        qualityDistribution
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
      icon: Activity,
      value: stats?.tracksAnalyzedToday || 0,
      label: 'Tracks Today',
      color: 'text-primary'
    },
    {
      icon: Zap,
      value: `${stats?.avgProcessingTimeSec || 0}s`,
      label: 'Avg Processing',
      color: 'text-accent-cyan'
    },
    {
      icon: TrendingUp,
      value: stats?.topGenre || 'Unknown',
      label: 'Top Genre',
      color: 'text-accent-blue'
    },
    {
      icon: BarChart3,
      value: stats?.qualityDistribution.high || 0,
      label: 'High Quality',
      color: 'text-green-500'
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

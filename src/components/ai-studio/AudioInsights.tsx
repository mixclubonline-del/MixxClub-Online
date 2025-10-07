import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Music, TrendingUp } from 'lucide-react';

export default function AudioInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['audio-insights'],
    queryFn: async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('ai_audio_profiles')
        .select('genre_prediction, tempo_bpm, key_signature')
        .gte('created_at', oneWeekAgo)
        .not('genre_prediction', 'is', null)
        .limit(200);

      if (error) throw error;

      const genreCount: Record<string, number> = {};
      const keyCount: Record<string, number> = {};
      const tempos: number[] = [];

      data?.forEach(profile => {
        if (profile.genre_prediction && typeof profile.genre_prediction === 'object') {
          const topGenre = Object.keys(profile.genre_prediction)[0];
          if (topGenre) genreCount[topGenre] = (genreCount[topGenre] || 0) + 1;
        }
        if (profile.key_signature) {
          keyCount[profile.key_signature] = (keyCount[profile.key_signature] || 0) + 1;
        }
        if (profile.tempo_bpm) {
          tempos.push(profile.tempo_bpm);
        }
      });

      const avgTempo = tempos.length > 0
        ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
        : 0;

      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const topKey = Object.entries(keyCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

      return {
        topGenres,
        avgTempo,
        topKey,
        totalAnalyzed: data?.length || 0
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Top Genres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights?.topGenres.map(([genre, count], i) => (
              <div key={genre} className="flex items-center justify-between">
                <span className="text-sm capitalize">{genre}</span>
                <span className="text-xs text-muted-foreground">{count} tracks</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
            Average Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-accent-cyan">{insights?.avgTempo || 0}</p>
          <p className="text-xs text-muted-foreground">BPM this week</p>
        </CardContent>
      </Card>

      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="w-4 h-4 text-accent-blue" />
            Most Common Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-accent-blue">{insights?.topKey || 'N/A'}</p>
          <p className="text-xs text-muted-foreground">Key signature</p>
        </CardContent>
      </Card>
    </div>
  );
}

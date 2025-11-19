import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, TrendingUp, Music } from 'lucide-react';

export default function TrendingTracks() {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['trending-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audio_files')
        .select(`
          id,
          file_name,
          created_at,
          duration_seconds,
          ai_audio_profiles(
            loudness_lufs,
            dynamic_range,
            genre_prediction,
            tempo_bpm,
            key_signature
          ),
          profiles!audio_files_uploaded_by_fkey(full_name)
        `)
        .not('ai_audio_profiles', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(20);

      if (error) throw error;

      return (data || [])
        .filter(t => t.ai_audio_profiles && t.ai_audio_profiles.length > 0)
        .map(t => ({
          ...t,
          score: (t.ai_audio_profiles[0]?.loudness_lufs ? Math.abs(t.ai_audio_profiles[0].loudness_lufs) : 0) + (t.ai_audio_profiles[0]?.dynamic_range || 0)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {tracks?.map((track, index) => {
        const profile = track.ai_audio_profiles?.[0];
        const genre = profile?.genre_prediction 
          ? (typeof profile.genre_prediction === 'string' ? profile.genre_prediction : Object.entries(profile.genre_prediction as unknown as Record<string, number>)[0]?.[0])
          : 'Unknown';

        return (
          <Card key={track.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-all group">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-all">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {index < 3 && (
                      <Badge variant="secondary" className="gap-1">
                        <TrendingUp className="w-3 h-3" />
                        #{index + 1}
                      </Badge>
                    )}
                    <h4 className="font-semibold text-sm truncate">{track.file_name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    by {(track.profiles as any)?.full_name || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Badge variant="outline" className="text-xs">{genre}</Badge>
                    {profile?.tempo_bpm && <span>{Math.round(profile.tempo_bpm)} BPM</span>}
                    {profile?.key_signature && <span>{profile.key_signature}</span>}
                  </div>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Play className="w-3 h-3" />
                    Listen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

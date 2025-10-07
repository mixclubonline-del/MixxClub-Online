import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Sparkles, ArrowRight } from 'lucide-react';

export default function MatchIntelligence() {
  const { user } = useAuth();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['ai-collaboration-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('ai_collaboration_matches')
        .select(`
          *,
          artist:profiles!ai_collaboration_matches_artist_id_fkey(full_name, avatar_url),
          engineer:profiles!ai_collaboration_matches_engineer_id_fkey(full_name, avatar_url)
        `)
        .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`)
        .eq('match_status', 'suggested')
        .order('compatibility_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Sign in to see AI matches</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No AI matches available yet</p>
          <p className="text-xs text-muted-foreground mt-2">
            Upload more tracks to improve matching
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const isArtist = match.artist_id === user?.id;
        const otherUser = isArtist ? match.engineer : match.artist;
        const compatScore = Math.round((match.compatibility_score || 0) * 100);

        return (
          <Card key={match.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-all group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                  <AvatarImage src={(otherUser as any)?.avatar_url || ''} />
                  <AvatarFallback>{((otherUser as any)?.full_name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{(otherUser as any)?.full_name || 'User'}</h4>
                  <p className="text-xs text-muted-foreground">
                    {isArtist ? 'Engineer Match' : 'Artist Match'}
                  </p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                  <Sparkles className="w-3 h-3" />
                  {compatScore}% Match
                </Badge>
              </div>

              {match.complementary_skills && Array.isArray(match.complementary_skills) && match.complementary_skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(match.complementary_skills as string[]).slice(0, 3).map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                Connect Now
                <ArrowRight className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

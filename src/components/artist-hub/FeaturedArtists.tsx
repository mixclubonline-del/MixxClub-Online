import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, TrendingUp } from 'lucide-react';

export default function FeaturedArtists() {
  const { data: artists, isLoading } = useQuery({
    queryKey: ['featured-artists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          projects!projects_user_id_fkey(id, status)
        `)
        .limit(8);
      
      if (error) throw error;

      return data
        .map(artist => ({
          ...artist,
          projectCount: artist.projects?.filter((p: any) => p.status === 'completed').length || 0
        }))
        .filter(a => a.projectCount > 0)
        .sort((a, b) => b.projectCount - a.projectCount)
        .slice(0, 6);
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4 text-center">
              <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {artists?.map((artist) => (
        <Card key={artist.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
          <CardContent className="p-4 text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
              <AvatarImage src={artist.avatar_url || ''} />
              <AvatarFallback>{artist.full_name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold mb-1 truncate">{artist.full_name || 'Anonymous'}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Music className="w-3 h-3" />
              <span>{artist.projectCount} projects</span>
            </div>
            {artist.projectCount >= 10 && (
              <Badge variant="secondary" className="mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Top Artist
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

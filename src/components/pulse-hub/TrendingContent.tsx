import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Eye, Music, Star } from 'lucide-react';

export default function TrendingContent() {
  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending-content'],
    queryFn: async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [trendingProjects, trendingEngineers] = await Promise.all([
        supabase
          .from('projects')
          .select('id, title, created_at, client_id, engineer_id, profiles!projects_client_id_fkey(full_name)')
          .eq('status', 'completed')
          .gte('updated_at', oneWeekAgo)
          .limit(5),
        supabase
          .from('engineer_leaderboard')
          .select('engineer_id, completed_projects, average_rating, profiles(full_name, avatar_url)')
          .order('average_rating', { ascending: false })
          .limit(3)
      ]);

      return {
        projects: trendingProjects.data || [],
        engineers: trendingEngineers.data || []
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardHeader>
              <Skeleton className="h-5 w-48 mb-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Trending Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trending?.projects.slice(0, 3).map((project, i) => (
            <div key={project.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-card/50 transition-all">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                #{i + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{project.title}</p>
                <p className="text-xs text-muted-foreground">
                  by {(project.profiles as any)?.full_name || 'Artist'}
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-accent-cyan" />
            Hot Engineers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trending?.engineers.map((engineer, i) => (
            <div key={engineer.engineer_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-card/50 transition-all">
              <Badge className="bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30">
                #{i + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{(engineer.profiles as any)?.full_name || 'Engineer'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{engineer.average_rating?.toFixed(1)}</span>
                  <span>•</span>
                  <span>{engineer.completed_projects} projects</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

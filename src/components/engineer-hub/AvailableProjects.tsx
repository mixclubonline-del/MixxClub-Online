import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, DollarSign, Calendar, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AvailableProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['available-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          id,
          title,
          budget,
          deadline,
          created_at,
          description,
          artist_id
        `)
        .eq('status', 'open')
        .order('budget', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      // Fetch artist profiles separately
      if (data && data.length > 0) {
        const artistIds = data.map(p => p.artist_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', artistIds);
        
        return data.map(project => ({
          ...project,
          artist: profiles?.find(p => p.id === project.artist_id)
        }));
      }
      
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardHeader>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No projects available right now</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-all group">
          <CardHeader>
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={(project as any).artist?.avatar_url || ''} />
                <AvatarFallback>{(project as any).artist?.full_name?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{(project as any).artist?.full_name || 'Artist'}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3" />
                  <span>New Client</span>
                </div>
              </div>
            </div>

            <CardTitle className="text-base mb-2">{project.title}</CardTitle>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {project.description || 'No description provided'}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              {project.budget && (
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>${project.budget}</span>
                </div>
              )}
              {project.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">{formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}</span>
                </div>
              )}
            </div>


            <Button size="sm" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
              <Briefcase className="w-4 h-4" />
              View Details
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

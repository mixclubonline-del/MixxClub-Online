import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Music, Star } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';

export default function TrendingContent() {
  const { data, isLoading } = useDemoData('all');

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

  const sessions = data?.sessions || [];
  const engineers = data?.engineers || [];

  return (
    <div className="space-y-4">
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Trending Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.slice(0, 3).map((session, i) => (
            <div key={session.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-card/50 transition-all">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                #{i + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  by {session.host?.name || 'Artist'}
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
          {engineers.slice(0, 3).map((engineer, i) => (
            <div key={engineer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-card/50 transition-all">
              <Badge className="bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30">
                #{i + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{engineer.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{engineer.rating?.toFixed(1)}</span>
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

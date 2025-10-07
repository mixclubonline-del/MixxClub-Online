import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Trophy, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RecentAchievements() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['recent-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          id,
          earned_at,
          badge_name,
          badge_description,
          badge_type,
          user_id,
          profiles(full_name, avatar_url)
        `)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card/20 backdrop-blur-sm border-white/5">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recent achievements</p>
        </CardContent>
      </Card>
    );
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'first_project': return 'text-primary';
      case 'projects_10': return 'text-accent-cyan';
      case 'projects_50': return 'text-accent-blue';
      case 'five_star': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className="bg-card/20 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all group">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                <AvatarImage src={(achievement.profiles as any)?.avatar_url || ''} />
                <AvatarFallback>{((achievement.profiles as any)?.full_name || 'U')[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                <Award className={`w-4 h-4 ${getBadgeColor(achievement.badge_type)}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{(achievement.profiles as any)?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate mb-1">
                earned {achievement.badge_name}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  Achievement
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

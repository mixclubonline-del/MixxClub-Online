import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, DollarSign, Briefcase } from 'lucide-react';

export default function TopEngineersLeaderboard() {
  const { data: engineers, isLoading } = useQuery({
    queryKey: ['top-engineers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_leaderboard')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    if (rank === 2) return { icon: '🥈', color: 'bg-gray-400/20 text-gray-300 border-gray-400/30' };
    if (rank === 3) return { icon: '🥉', color: 'bg-amber-600/20 text-amber-400 border-amber-600/30' };
    return { icon: `#${rank}`, color: 'bg-primary/20 text-primary border-primary/30' };
  };

  return (
    <div className="space-y-3">
      {engineers?.map((engineer) => {
        const badge = getRankBadge(engineer.rank);
        
        return (
          <Card key={engineer.id} className={`backdrop-blur-sm transition-all hover:scale-[1.02] ${
            engineer.rank <= 3 ? 'bg-card/50 border-primary/30' : 'bg-card/30 border-white/5'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Badge className={`text-lg font-bold px-3 py-1 ${badge.color}`}>
                  {badge.icon}
                </Badge>
                
                <Avatar className={`w-12 h-12 ${engineer.rank <= 3 ? 'ring-2 ring-primary' : ''}`}>
                  <AvatarImage src={engineer.profiles?.avatar_url || ''} />
                  <AvatarFallback>{engineer.profiles?.full_name?.charAt(0) || 'E'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{engineer.profiles?.full_name || 'Engineer'}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{engineer.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{engineer.completed_projects || 0} projects</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>${engineer.total_earnings?.toFixed(0) || '0'}</span>
                    </div>
                  </div>
                </div>

                {engineer.rank <= 3 && (
                  <Trophy className="w-6 h-6 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

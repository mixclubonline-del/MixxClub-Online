import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Trophy, Briefcase, Award } from 'lucide-react';

export default function EngineerSpotlight() {
  const { data: spotlight, isLoading } = useQuery({
    queryKey: ['engineer-spotlight'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_leaderboard')
        .select(`
          *,
          profiles(full_name, avatar_url, bio)
        `)
        .order('rank', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      
      // Fetch badges separately
      if (data) {
        const { data: badges } = await supabase
          .from('engineer_badges')
          .select('badge_name, badge_rarity')
          .eq('engineer_id', data.engineer_id)
          .limit(4);
        
        return { ...data, badges: badges || [] };
      }
      
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader className="text-center">
          <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
      </Card>
    );
  }

  if (!spotlight) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card/30 to-accent-blue/10 backdrop-blur-sm border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-blue/20 rounded-full blur-3xl" />
      
      <CardHeader className="text-center relative z-10">
        <div className="flex justify-center mb-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
            <Trophy className="w-3 h-3" />
            Engineer of the Week
          </Badge>
        </div>

        <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/50">
          <AvatarImage src={spotlight.profiles?.avatar_url || ''} />
          <AvatarFallback className="text-2xl">{spotlight.profiles?.full_name?.charAt(0) || 'E'}</AvatarFallback>
        </Avatar>

        <h3 className="text-2xl font-bold mb-2">{spotlight.profiles?.full_name || 'Engineer'}</h3>
        
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-semibold">{spotlight.average_rating?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{spotlight.completed_projects || 0} projects</span>
          </div>
        </div>

        {spotlight.profiles?.bio && (
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            {spotlight.profiles.bio}
          </p>
        )}

        {(spotlight as any).badges && (spotlight as any).badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {(spotlight as any).badges.map((badge: any, i: number) => (
              <Badge key={i} variant="outline" className="gap-1">
                <Award className="w-3 h-3" />
                {badge.badge_name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="text-center relative z-10">
        <Button className="gap-2">
          <Briefcase className="w-4 h-4" />
          Book This Engineer
        </Button>
      </CardContent>
    </Card>
  );
}

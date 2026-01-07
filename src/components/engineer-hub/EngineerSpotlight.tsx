import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Award, Briefcase, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface SpotlightEngineer {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  rating: number | null;
  completed_projects: number | null;
  trending_score: number | null;
}

export default function EngineerSpotlight() {
  const { data: engineer, isLoading } = useQuery({
    queryKey: ['engineer-spotlight'],
    queryFn: async () => {
      // Get top trending engineer or random from top 10
      const { data: engineers, error } = await supabase
        .from('engineer_profiles')
        .select(`
          user_id,
          specialties,
          rating,
          completed_projects,
          trending_score
        `)
        .eq('availability_status', 'available')
        .order('trending_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!engineers?.length) return null;

      // Pick a random engineer from top 10 for variety
      const randomIndex = Math.floor(Math.random() * engineers.length);
      const selected = engineers[randomIndex];

      // Get profile details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .eq('id', selected.user_id)
        .single();

      if (profileError) throw profileError;

      return {
        ...profile,
        specialties: selected.specialties,
        rating: selected.rating,
        completed_projects: selected.completed_projects,
        trending_score: selected.trending_score,
      } as SpotlightEngineer;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Engineer Spotlight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!engineer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Engineer Spotlight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No featured engineers available at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const initials = engineer.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Engineer Spotlight
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={engineer.avatar_url || undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            {engineer.trending_score && engineer.trending_score > 80 && (
              <Badge className="absolute -top-1 -right-1 gap-1" variant="default">
                <TrendingUp className="h-3 w-3" />
                Hot
              </Badge>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg">{engineer.full_name || 'Anonymous Engineer'}</h3>
            {engineer.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{engineer.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{engineer.rating?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{engineer.completed_projects || 0} projects</span>
            </div>
          </div>

          {/* Specialties */}
          {engineer.specialties && engineer.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {engineer.specialties.slice(0, 4).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/profile/${engineer.id}`}>View Profile</a>
            </Button>
            <Button size="sm" asChild>
              <a href={`/messages?to=${engineer.id}`}>Hire</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

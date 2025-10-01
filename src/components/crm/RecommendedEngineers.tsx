import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Music, Star, Clock, Headphones, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface EngineerMatch {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  specialties: string[];
  rating_average: number;
  total_projects_completed: number;
  is_available: boolean;
  turnaround_days: number;
  mixing_rate_per_song: number;
  match_score: number;
  match_reason: string;
}

export const RecommendedEngineers = () => {
  const [engineers, setEngineers] = useState<EngineerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendedEngineers();
  }, []);

  const fetchRecommendedEngineers = async () => {
    try {
      // Fetch engineer profiles with their user data
      const { data: engineerProfiles, error } = await supabase
        .from('engineer_profiles')
        .select(`
          *,
          profiles!engineer_profiles_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_available', true)
        .order('rating_average', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Calculate match scores and reasons
      const matchedEngineers = engineerProfiles?.map((profile: any) => {
        let matchScore = 0;
        let matchReasons = [];

        // High rating bonus
        if (profile.rating_average >= 4.5) {
          matchScore += 30;
          matchReasons.push('Top-rated pro');
        }

        // Experience bonus
        if (profile.total_projects_completed >= 10) {
          matchScore += 25;
          matchReasons.push('Highly experienced');
        }

        // Fast turnaround bonus
        if (profile.turnaround_days <= 5) {
          matchScore += 20;
          matchReasons.push('Quick turnaround');
        }

        // Availability bonus
        if (profile.is_available) {
          matchScore += 15;
          matchReasons.push('Available now');
        }

        // Specialty diversity
        if (profile.specialties?.length >= 3) {
          matchScore += 10;
          matchReasons.push('Versatile sound');
        }

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.profiles?.full_name || 'Unknown Engineer',
          avatar_url: profile.profiles?.avatar_url,
          specialties: profile.specialties || [],
          rating_average: profile.rating_average || 0,
          total_projects_completed: profile.total_projects_completed || 0,
          is_available: profile.is_available,
          turnaround_days: profile.turnaround_days || 7,
          mixing_rate_per_song: profile.mixing_rate_per_song || 0,
          match_score: matchScore,
          match_reason: matchReasons[0] || 'Great engineer'
        };
      }) || [];

      // Sort by match score
      matchedEngineers.sort((a, b) => b.match_score - a.match_score);

      setEngineers(matchedEngineers);
    } catch (error: any) {
      console.error('Error fetching recommended engineers:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-blue-500';
    return 'text-yellow-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding your perfect match...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (engineers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Headphones className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No engineers available right now</h3>
        <p className="text-muted-foreground">Check back soon for new recommendations</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Recommended Engineers for Your Sound
          </h2>
          <p className="text-muted-foreground">Pros matched to your musical style and needs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engineers.map((engineer) => (
          <Card key={engineer.id} className="p-6 hover:shadow-lg transition-all hover:border-primary/50">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={engineer.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10">
                      {engineer.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{engineer.full_name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{engineer.rating_average.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({engineer.total_projects_completed} tracks)
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getMatchScoreColor(engineer.match_score)}`} variant="outline">
                  {engineer.match_score}% match
                </Badge>
              </div>

              {/* Match Reason */}
              <div className="flex items-center gap-2 text-sm bg-primary/5 rounded-lg p-2">
                <Music className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">{engineer.match_reason}</span>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2">
                {engineer.specialties.slice(0, 3).map((specialty, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              {/* Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{engineer.turnaround_days} day turnaround</span>
                </div>
                {engineer.is_available && (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Available
                  </Badge>
                )}
              </div>

              {/* Price */}
              {engineer.mixing_rate_per_song > 0 && (
                <div className="text-lg font-bold text-primary">
                  ${engineer.mixing_rate_per_song}
                  <span className="text-sm text-muted-foreground font-normal">/track</span>
                </div>
              )}

              {/* Action */}
              <Button 
                className="w-full" 
                onClick={() => navigate(`/engineer/${engineer.user_id}`)}
              >
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/engineer-directory')}
        >
          Browse All Engineers
        </Button>
      </div>
    </div>
  );
};
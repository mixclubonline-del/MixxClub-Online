import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Music, Clock, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ArtistMatch {
  id: string;
  artist_id: string;
  artist_name: string;
  avatar_url: string | null;
  title: string;
  genre: string | null;
  budget: number;
  service_type: string;
  deadline: string | null;
  match_score: number;
  match_reason: string;
  created_at: string;
}

export const RecommendedArtists = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<ArtistMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRecommendedArtists();
    }
  }, [user]);

  const fetchRecommendedArtists = async () => {
    if (!user) return;

    try {
      // Fetch engineer profile to get specialties
      const { data: engineerProfile } = await supabase
        .from('engineer_profiles')
        .select('specialties')
        .eq('user_id', user.id)
        .maybeSingle();

      const userSpecialties = engineerProfile?.specialties || [];

      // Fetch open job postings
      const { data: jobPostings, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'open')
        .is('assigned_engineer_id', null)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      // Get artist profiles separately
      const artistIds = [...new Set(jobPostings?.map(job => job.artist_id) || [])];
      const { data: artistProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', artistIds);

      const artistMap = new Map(artistProfiles?.map(a => [a.id, a]) || []);

      // Calculate match scores
      const matchedOpportunities = jobPostings?.map((job: any) => {
        let matchScore = 0;
        let matchReasons = [];

        // Genre match
        if (job.genre && userSpecialties.some((s: string) => 
          s.toLowerCase().includes(job.genre.toLowerCase()) || 
          job.genre.toLowerCase().includes(s.toLowerCase())
        )) {
          matchScore += 40;
          matchReasons.push('Perfect genre match');
        }

        // Budget match
        if (job.budget >= 100) {
          matchScore += 25;
          matchReasons.push('Great budget');
        } else if (job.budget >= 50) {
          matchScore += 15;
          matchReasons.push('Fair budget');
        }

        // Recent posting
        const postAge = Date.now() - new Date(job.created_at).getTime();
        const hoursSincePost = postAge / (1000 * 60 * 60);
        if (hoursSincePost < 24) {
          matchScore += 20;
          matchReasons.push('New opportunity');
        }

        // Service type match
        if (job.service_type === 'mixing') {
          matchScore += 15;
        }

        const artist = artistMap.get(job.artist_id);

        return {
          id: job.id,
          artist_id: job.artist_id,
          artist_name: artist?.full_name || 'Unknown Artist',
          avatar_url: artist?.avatar_url || null,
          title: job.title,
          genre: job.genre,
          budget: job.budget || 0,
          service_type: job.service_type,
          deadline: job.deadline,
          match_score: matchScore,
          match_reason: matchReasons[0] || 'Good opportunity',
          created_at: job.created_at
        };
      }) || [];

      // Sort by match score
      matchedOpportunities.sort((a, b) => b.match_score - a.match_score);

      setOpportunities(matchedOpportunities);
    } catch (error: any) {
      console.error('Error fetching recommended artists:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500 border-green-500';
    if (score >= 50) return 'text-blue-500 border-blue-500';
    return 'text-yellow-500 border-yellow-500';
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'mixing':
        return '🎚️';
      case 'mastering':
        return '✨';
      case 'production':
        return '🎹';
      default:
        return '🎵';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding artists looking for your sound...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No matching opportunities right now</h3>
        <p className="text-muted-foreground mb-4">Check back soon for new artist projects</p>
        <Button variant="outline" onClick={() => navigate('/jobs')}>
          Browse All Opportunities
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Artists Looking for Your Sound
          </h2>
          <p className="text-muted-foreground">Opportunities matched to your expertise and style</p>
        </div>
        <Button variant="outline" onClick={fetchRecommendedArtists}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="p-6 hover:shadow-lg transition-all hover:border-primary/50">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={opportunity.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10">
                      {opportunity.artist_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{opportunity.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{opportunity.artist_name}</p>
                  </div>
                </div>
                <Badge className={getMatchScoreColor(opportunity.match_score)} variant="outline">
                  {opportunity.match_score}%
                </Badge>
              </div>

              {/* Match Reason */}
              <div className="flex items-center gap-2 text-sm bg-primary/5 rounded-lg p-2">
                <Music className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">{opportunity.match_reason}</span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {opportunity.genre && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getServiceTypeIcon(opportunity.service_type)} {opportunity.service_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.genre}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {opportunity.deadline 
                        ? `Due ${new Date(opportunity.deadline).toLocaleDateString()}`
                        : 'Flexible deadline'
                      }
                    </span>
                  </div>
                  
                  {opportunity.budget > 0 && (
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{opportunity.budget}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <Button 
                className="w-full" 
                onClick={() => navigate('/jobs')}
              >
                View & Apply
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/jobs')}
        >
          Browse All Opportunities
        </Button>
      </div>
    </div>
  );
};
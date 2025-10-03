import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Mail, Loader2, Heart, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface EngineerMatch {
  engineerId: string;
  engineerName: string;
  avatarUrl?: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  matchScore: number;
  matchingGenres: string[];
  portfolioLinks: any[];
}

export const YourMatches = () => {
  const [matches, setMatches] = useState<EngineerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedEngineers, setSavedEngineers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // Get qualifier data from localStorage
      const qualifierData = localStorage.getItem('qualifierData');
      
      if (!qualifierData) {
        setLoading(false);
        return;
      }

      const data = JSON.parse(qualifierData);
      
      // If we already have matchedEngineers, fetch their full data
      if (data.matchedEngineers && data.matchedEngineers.length > 0) {
        await fetchEngineerDetails(data.matchedEngineers);
      } else if (data.budget && data.genre) {
        // Otherwise, re-run the matching
        await runMatching(data);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load your matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineerDetails = async (engineerIds: string[]) => {
    const { data: engineers } = await supabase
      .from('engineer_profiles')
      .select(`
        user_id,
        specialties,
        years_of_experience,
        rating_average,
        total_reviews,
        hourly_rate,
        is_available,
        portfolio_links,
        profile:profiles!engineer_profiles_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .in('user_id', engineerIds);

    if (engineers) {
      const formattedMatches: EngineerMatch[] = engineers.map((eng: any) => ({
        engineerId: eng.user_id,
        engineerName: eng.profile?.full_name || 'Unknown',
        avatarUrl: eng.profile?.avatar_url,
        specialties: eng.specialties || [],
        experience: eng.years_of_experience,
        rating: eng.rating_average,
        totalReviews: eng.total_reviews,
        hourlyRate: eng.hourly_rate,
        matchScore: 95, // Default high score since these were pre-matched
        matchingGenres: eng.specialties || [],
        portfolioLinks: eng.portfolio_links || [],
      }));
      
      setMatches(formattedMatches);
    }
  };

  const runMatching = async (data: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('match-engineers', {
        body: {
          budgetRange: data.budget,
          genres: [data.genre],
          projectType: data.projectType,
        },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });

      if (response.data?.matches) {
        setMatches(response.data.matches);
        
        // Update localStorage with matched engineer IDs
        localStorage.setItem('qualifierData', JSON.stringify({
          ...data,
          matchedEngineers: response.data.matches.map((m: EngineerMatch) => m.engineerId),
        }));
      }
    } catch (error) {
      console.error('Error running matching:', error);
      toast.error('Failed to find matches');
    }
  };

  const handleSaveEngineer = async (engineerId: string) => {
    if (savedEngineers.has(engineerId)) {
      setSavedEngineers(prev => {
        const newSet = new Set(prev);
        newSet.delete(engineerId);
        return newSet;
      });
      toast.success('Engineer removed from saved list');
    } else {
      setSavedEngineers(prev => new Set(prev).add(engineerId));
      toast.success('Engineer saved!');
    }
  };

  const handleContactEngineer = (engineerId: string) => {
    navigate(`/artist-crm?tab=projects&action=new&engineer=${engineerId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading your matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
          <Star className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No matches yet</h3>
        <p className="text-muted-foreground mb-6">
          Complete the smart qualifier to find engineers perfect for your music
        </p>
        <Button onClick={() => navigate('/')}>
          Find Your Engineer Match
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Your Engineer Matches</h2>
          <p className="text-muted-foreground mt-1">
            We found {matches.length} engineers perfect for your needs
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Refine Matches
        </Button>
      </div>

      <div className="grid gap-6">
        {matches.map((engineer) => (
          <Card key={engineer.engineerId} className="p-6 hover:border-primary transition-all">
            <div className="flex items-start gap-6">
              <div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 bg-cover bg-center flex-shrink-0"
                style={engineer.avatarUrl ? { backgroundImage: `url(${engineer.avatarUrl})` } : {}}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold">{engineer.engineerName}</h3>
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                        {engineer.matchScore}% Match
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{engineer.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {engineer.totalReviews} reviews
                      </span>
                      {engineer.experience > 0 && (
                        <Badge variant="outline">{engineer.experience}+ years experience</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-3xl font-bold">${engineer.hourlyRate}</p>
                    <p className="text-sm text-muted-foreground">per track</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {engineer.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {engineer.matchingGenres.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Matching your preferences:</span>{' '}
                      {engineer.matchingGenres.join(', ')}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleContactEngineer(engineer.engineerId)}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Project
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleSaveEngineer(engineer.engineerId)}
                    className={savedEngineers.has(engineer.engineerId) ? 'border-primary' : ''}
                  >
                    <Heart 
                      className={`w-4 h-4 ${savedEngineers.has(engineer.engineerId) ? 'fill-primary text-primary' : ''}`} 
                    />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

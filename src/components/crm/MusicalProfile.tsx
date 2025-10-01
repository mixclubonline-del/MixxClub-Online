import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Music, Mic, Disc, Headphones, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MusicalStats {
  totalTracks: number;
  genresWorkedWith: string[];
  averageRating: number;
  completionRate: number;
  specialties: string[];
  topGenre: string;
  musicality: number;
}

interface MusicalProfileProps {
  userType: 'artist' | 'engineer';
}

export const MusicalProfile = ({ userType }: MusicalProfileProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MusicalStats>({
    totalTracks: 0,
    genresWorkedWith: [],
    averageRating: 0,
    completionRate: 0,
    specialties: [],
    topGenre: '',
    musicality: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMusicalProfile();
    }
  }, [user]);

  const fetchMusicalProfile = async () => {
    if (!user) return;

    try {
      if (userType === 'engineer') {
        // Fetch engineer profile
        const { data: engineerProfile } = await supabase
          .from('engineer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Fetch projects
        const { data: projects } = await supabase
          .from('projects')
          .select('*, job_postings!projects_job_id_fkey(genre)')
          .eq('engineer_id', user.id);

        const genresSet = new Set<string>();
        projects?.forEach((p: any) => {
          if (p.job_postings?.genre) {
            genresSet.add(p.job_postings.genre);
          }
        });

        const genres = Array.from(genresSet);
        const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
        const totalProjects = projects?.length || 0;
        const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

        // Calculate musicality score
        const musicality = Math.min(100, 
          (engineerProfile?.total_projects_completed || 0) * 5 +
          (engineerProfile?.rating_average || 0) * 15 +
          genres.length * 3
        );

        setStats({
          totalTracks: engineerProfile?.total_projects_completed || 0,
          genresWorkedWith: genres,
          averageRating: engineerProfile?.rating_average || 0,
          completionRate,
          specialties: engineerProfile?.specialties || [],
          topGenre: genres[0] || 'Various',
          musicality
        });
      } else {
        // Fetch artist projects
        const { data: projects } = await supabase
          .from('projects')
          .select('*, job_postings!projects_job_id_fkey(genre)')
          .eq('client_id', user.id);

        const genresSet = new Set<string>();
        projects?.forEach((p: any) => {
          if (p.job_postings?.genre) {
            genresSet.add(p.job_postings.genre);
          }
        });

        const genres = Array.from(genresSet);
        const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
        const totalProjects = projects?.length || 0;
        const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

        // Calculate musicality score for artists
        const musicality = Math.min(100,
          totalProjects * 8 +
          genres.length * 5 +
          completionRate * 0.3
        );

        setStats({
          totalTracks: totalProjects,
          genresWorkedWith: genres,
          averageRating: 0,
          completionRate,
          specialties: genres,
          topGenre: genres[0] || 'Exploring',
          musicality
        });
      }
    } catch (error: any) {
      console.error('Error fetching musical profile:', error);
      toast.error('Failed to load musical profile');
    } finally {
      setLoading(false);
    }
  };

  const getMusicinalityLevel = (score: number) => {
    if (score >= 80) return { label: 'Master', color: 'text-purple-500' };
    if (score >= 60) return { label: 'Expert', color: 'text-blue-500' };
    if (score >= 40) return { label: 'Professional', color: 'text-green-500' };
    if (score >= 20) return { label: 'Developing', color: 'text-yellow-500' };
    return { label: 'Beginner', color: 'text-gray-500' };
  };

  const musicalityLevel = getMusicinalityLevel(stats.musicality);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              {userType === 'artist' ? 'Your Musical DNA' : 'Your Sound Signature'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {userType === 'artist' 
                ? 'Your unique musical fingerprint based on your projects'
                : 'Your professional sound identity across all sessions'
              }
            </p>
          </div>
          <div className={`text-2xl font-bold ${musicalityLevel.color}`}>
            {musicalityLevel.label}
          </div>
        </div>

        {/* Musicality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Musicality Score</span>
            <span className="font-bold text-primary">{stats.musicality}/100</span>
          </div>
          <Progress value={stats.musicality} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="flex items-center justify-center mb-2">
              <Disc className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.totalTracks}</div>
            <div className="text-xs text-muted-foreground">
              {userType === 'artist' ? 'Tracks Created' : 'Tracks Mixed'}
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="flex items-center justify-center mb-2">
              <Headphones className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.genresWorkedWith.length}</div>
            <div className="text-xs text-muted-foreground">Genres Explored</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Completion Rate</div>
          </div>

          {userType === 'engineer' && (
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Avg Rating</div>
            </div>
          )}
        </div>

        {/* Musical Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {userType === 'artist' ? 'Your Musical Journey' : 'Your Sonic Palette'}
            </span>
          </div>
          
          {stats.genresWorkedWith.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.genresWorkedWith.map((genre, idx) => (
                <Badge 
                  key={idx} 
                  variant={idx === 0 ? 'default' : 'secondary'}
                  className={idx === 0 ? 'bg-primary text-primary-foreground' : ''}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Start your musical journey by {userType === 'artist' ? 'creating projects' : 'working on tracks'}
            </p>
          )}
        </div>

        {/* Specialties for Engineers */}
        {userType === 'engineer' && stats.specialties.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Your Specialties</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.specialties.map((specialty, idx) => (
                <Badge key={idx} variant="outline" className="border-primary/30">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
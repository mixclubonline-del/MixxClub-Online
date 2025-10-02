import { useState } from 'react';
import { Brain, Zap, Music, TrendingUp, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface EngineerMatch {
  id: string;
  name: string;
  avatar: string;
  matchScore: number;
  genres: string[];
  specialties: string[];
  rating: number;
  completedProjects: number;
  responseTime: string;
  reasons: string[];
}

interface AIMatchingEngineProps {
  userGenre?: string;
  projectType?: 'mixing' | 'mastering';
  budget?: number;
  urgency?: 'low' | 'medium' | 'high';
}

export const AIMatchingEngine = ({ 
  userGenre = 'Hip Hop',
  projectType = 'mixing',
  budget = 500,
  urgency = 'medium'
}: AIMatchingEngineProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matches, setMatches] = useState<EngineerMatch[]>([]);
  const navigate = useNavigate();

  // Simulated AI matching - in production, this would call an edge function
  const findMatches = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockMatches: EngineerMatch[] = [
      {
        id: '1',
        name: 'Marcus Chen',
        avatar: '/placeholder.svg',
        matchScore: 98,
        genres: ['Hip Hop', 'Trap', 'R&B'],
        specialties: ['Vocal Mixing', 'Beat Production'],
        rating: 4.9,
        completedProjects: 247,
        responseTime: '2 hours',
        reasons: [
          'Specializes in Hip Hop mixing',
          'High compatibility with your sound',
          'Fast turnaround time',
          'Excellent vocal processing skills'
        ]
      },
      {
        id: '2',
        name: 'Sarah Rodriguez',
        avatar: '/placeholder.svg',
        matchScore: 95,
        genres: ['Hip Hop', 'Pop', 'Urban'],
        specialties: ['Mastering', 'Mixing'],
        rating: 4.8,
        completedProjects: 189,
        responseTime: '4 hours',
        reasons: [
          'Grammy-nominated engineer',
          'Perfect genre alignment',
          'Similar projects completed',
          'Within your budget range'
        ]
      },
      {
        id: '3',
        name: 'DJ Apex',
        avatar: '/placeholder.svg',
        matchScore: 92,
        genres: ['Trap', 'Hip Hop', 'EDM'],
        specialties: ['Beat Mixing', '808 Processing'],
        rating: 4.7,
        completedProjects: 156,
        responseTime: '3 hours',
        reasons: [
          'Expert in 808 processing',
          'Trending engineer this month',
          'Quick response time',
          'High client satisfaction'
        ]
      }
    ];

    setMatches(mockMatches);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="glass-studio rounded-2xl p-6 border border-primary/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI-Powered Matching</h3>
            <p className="text-sm text-muted-foreground">
              Finding the perfect engineer for your {userGenre} {projectType} project
            </p>
          </div>
        </div>

        {!isAnalyzing && matches.length === 0 && (
          <Button 
            onClick={findMatches}
            size="lg"
            className="w-full shadow-glow"
          >
            <Zap className="w-5 h-5 mr-2" />
            Find My Perfect Match
          </Button>
        )}

        {isAnalyzing && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary animate-pulse-glow" />
              <span className="text-sm font-medium">Analyzing 247 engineers...</span>
            </div>
            <Progress value={66} className="h-2" />
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>✓ Genre compatibility</span>
              <span>✓ Style matching</span>
              <span>✓ Budget analysis</span>
              <span>✓ Quality scoring</span>
            </div>
          </div>
        )}
      </div>

      {/* Match Results */}
      {matches.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold">Top Matches</h4>
            <Badge variant="outline" className="border-green-500/30 text-green-500">
              <Target className="w-3 h-3 mr-1" />
              {matches.length} Perfect Matches
            </Badge>
          </div>

          {matches.map((match, index) => (
            <div
              key={match.id}
              className="glass-studio rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Match Score Banner */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-bold">{match.name}</h5>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span>{match.rating}</span>
                      <span>•</span>
                      <span>{match.completedProjects} projects</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {match.matchScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Match Score</div>
                </div>
              </div>

              {/* Genres & Specialties */}
              <div className="flex flex-wrap gap-2 mb-4">
                {match.genres.map(genre => (
                  <Badge key={genre} variant="outline" className="border-primary/30">
                    {genre}
                  </Badge>
                ))}
                {match.specialties.map(specialty => (
                  <Badge key={specialty} variant="outline" className="border-accent/30">
                    {specialty}
                  </Badge>
                ))}
              </div>

              {/* Match Reasons */}
              <div className="space-y-2 mb-4">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Why this match is perfect:
                </div>
                <ul className="space-y-1">
                  {match.reasons.map((reason, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Response Time */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  Avg response: <span className="font-semibold text-foreground">{match.responseTime}</span>
                </div>
                <Button onClick={() => navigate(`/engineer/${match.id}`)} className="shadow-glow-sm">
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Sparkles, MessageSquare, Heart, Star, Music, Headphones } from 'lucide-react';

interface AIMatchRecommendationsProps {
  userType: 'artist' | 'engineer';
  searchQuery: string;
}

export const AIMatchRecommendations: React.FC<AIMatchRecommendationsProps> = ({ userType, searchQuery }) => {
  const recommendations = [
    {
      id: '1',
      name: userType === 'artist' ? 'Marcus "808King" Williams' : 'Zara "VelvetVox" Johnson',
      avatar: '',
      matchScore: 96,
      genres: ['Hip-Hop', 'Trap', 'R&B'],
      skills: userType === 'artist' ? ['Mixing', 'Mastering', 'Vocal Production'] : ['Songwriting', 'Vocal Performance', 'Hook Writing'],
      rating: 4.9,
      completedProjects: 127,
      hourlyRate: userType === 'artist' ? 85 : undefined,
      bio: userType === 'artist' 
        ? 'Grammy-nominated engineer specializing in modern hip-hop production'
        : 'Rising artist with 2M+ streams looking for premium mixing',
      matchReasons: ['Genre alignment', 'Style compatibility', 'Budget match'],
      isVerified: true,
      isOnline: true,
    },
    {
      id: '2',
      name: userType === 'artist' ? 'Sarah "BeatMaven" Chen' : 'DeShawn "FlowMaster" Davis',
      avatar: '',
      matchScore: 92,
      genres: ['R&B', 'Soul', 'Neo-Soul'],
      skills: userType === 'artist' ? ['Mixing', 'Sound Design', 'Arrangement'] : ['Rap', 'Freestyle', 'Lyricism'],
      rating: 4.8,
      completedProjects: 89,
      hourlyRate: userType === 'artist' ? 65 : undefined,
      bio: userType === 'artist'
        ? 'Specializing in warm, analog-style mixes with modern clarity'
        : 'Independent artist seeking collaborative mixing sessions',
      matchReasons: ['Similar past projects', 'Complementary skills', 'Availability'],
      isVerified: true,
      isOnline: false,
    },
    {
      id: '3',
      name: userType === 'artist' ? 'James "LowEnd" Thompson' : 'Aaliyah "NightOwl" Martinez',
      avatar: '',
      matchScore: 88,
      genres: ['Drill', 'UK Rap', 'Grime'],
      skills: userType === 'artist' ? ['Mixing', 'Bass Enhancement', 'Spatial Audio'] : ['Singing', 'Melodies', 'Harmonies'],
      rating: 4.7,
      completedProjects: 156,
      hourlyRate: userType === 'artist' ? 75 : undefined,
      bio: userType === 'artist'
        ? 'Expert in hard-hitting drill and UK rap productions'
        : 'Multi-genre vocalist looking to expand into hip-hop collaborations',
      matchReasons: ['Technical expertise', 'Quick turnaround', 'Communication style'],
      isVerified: false,
      isOnline: true,
    },
  ];

  const filteredRecommendations = recommendations.filter(rec =>
    rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
    rec.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">
          AI analyzed your profile and found {filteredRecommendations.length} high-compatibility matches
        </span>
      </div>

      <div className="grid gap-4">
        {filteredRecommendations.map((match) => (
          <Card key={match.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={match.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary text-lg">
                        {match.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {match.isOnline && (
                      <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{match.name}</h3>
                      {match.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{match.bio}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.genres.map((genre) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          <Music className="h-3 w-3 mr-1" />
                          {genre}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          <Headphones className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[180px]">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-2xl font-bold">{match.matchScore}%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Match Score</span>
                  </div>
                  
                  <Progress value={match.matchScore} className="w-full h-2" />
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {match.rating}
                    </span>
                    <span>{match.completedProjects} projects</span>
                    {match.hourlyRate && <span>${match.hourlyRate}/hr</span>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Why this match:</p>
                <div className="flex flex-wrap gap-2">
                  {match.matchReasons.map((reason) => (
                    <Badge key={reason} variant="outline" className="text-xs bg-primary/5">
                      ✓ {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

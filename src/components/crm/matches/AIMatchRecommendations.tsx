import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Sparkles, MessageSquare, Heart, Star, Music, Headphones } from 'lucide-react';
import { HubSkeleton, EmptyState } from '../design';
import { useMatchesAPI } from '@/hooks/useMatchesAPI';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AIMatchRecommendationsProps {
  userType: 'artist' | 'engineer';
  searchQuery: string;
}

export const AIMatchRecommendations: React.FC<AIMatchRecommendationsProps> = ({ userType, searchQuery }) => {
  const { user } = useAuth();
  const { matches, findMatches, loading, saveMatch, sendRequest, savedMatches } = useMatchesAPI(userType);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectProjectType, setConnectProjectType] = useState('mixing');

  useEffect(() => {
    // Load initial matches with default criteria
    findMatches({
      budgetRange: '100-300',
      genres: ['Hip-Hop', 'R&B'],
      projectType: 'mixing',
    });
  }, [findMatches]);

  const handleSave = async (engineerId: string, matchScore: number) => {
    await saveMatch(engineerId, matchScore);
  };

  const handleConnect = async (engineerId: string) => {
    if (!connectMessage.trim()) {
      toast.error('Please add a message');
      return;
    }

    await sendRequest(
      engineerId,
      connectMessage,
      connectProjectType,
      '100-300',
      ['Hip-Hop', 'R&B']
    );
    setConnectingId(null);
    setConnectMessage('');
  };

  const isSaved = (engineerId: string) => {
    return savedMatches.some(m => m.matchedUserId === engineerId);
  };

  const filteredMatches = matches.filter(match =>
    match.engineerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
    match.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <HubSkeleton variant="cards" count={4} />;
  }

  if (filteredMatches.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No matches found"
        description="Try adjusting your filters or updating your profile"
      />
    );
  }
        <p className="text-muted-foreground">
          Try adjusting your search or upload a track to get personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">
          AI analyzed your profile and found {filteredMatches.length} high-compatibility matches
        </span>
      </div>

      <div className="grid gap-4">
        {filteredMatches.map((match) => (
          <Card key={match.engineerId} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={match.avatarUrl} />
                      <AvatarFallback className="bg-primary/20 text-primary text-lg">
                        {match.engineerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{match.engineerName}</h3>
                      {match.completedProjects > 10 && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {match.experience}+ years experience • {match.completedProjects} projects completed
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          <Music className="h-3 w-3 mr-1" />
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.specialties.slice(0, 3).map((skill) => (
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
                      {match.rating.toFixed(1)}
                    </span>
                    <span>{match.completedProjects} projects</span>
                    {match.hourlyRate > 0 && <span>${match.hourlyRate}/hr</span>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={isSaved(match.engineerId) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleSave(match.engineerId, match.matchScore)}
                      disabled={isSaved(match.engineerId)}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isSaved(match.engineerId) ? 'fill-primary' : ''}`} />
                      {isSaved(match.engineerId) ? 'Saved' : 'Save'}
                    </Button>

                    <Dialog open={connectingId === match.engineerId} onOpenChange={(open) => !open && setConnectingId(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setConnectingId(match.engineerId)}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connect with {match.engineerName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Project Type</label>
                            <Select value={connectProjectType} onValueChange={setConnectProjectType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mixing">Mixing</SelectItem>
                                <SelectItem value="mastering">Mastering</SelectItem>
                                <SelectItem value="production">Production</SelectItem>
                                <SelectItem value="full-service">Full Service</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Message</label>
                            <Textarea
                              placeholder="Introduce yourself and describe your project..."
                              value={connectMessage}
                              onChange={(e) => setConnectMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => handleConnect(match.engineerId)}
                          >
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {match.matchingGenres.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Why this match:</p>
                  <div className="flex flex-wrap gap-2">
                    {match.matchingGenres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs bg-primary/5">
                        ✓ {genre} specialist
                      </Badge>
                    ))}
                    {match.rating >= 4.5 && (
                      <Badge variant="outline" className="text-xs bg-primary/5">
                        ✓ Highly rated
                      </Badge>
                    )}
                    {match.completedProjects > 20 && (
                      <Badge variant="outline" className="text-xs bg-primary/5">
                        ✓ Experienced
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

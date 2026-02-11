import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Star, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useMatchesAPI } from '@/hooks/useMatchesAPI';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface SavedMatchesProps {
  userType: 'artist' | 'engineer' | 'producer';
  searchQuery: string;
}

export const SavedMatches: React.FC<SavedMatchesProps> = ({ userType, searchQuery }) => {
  const navigate = useNavigate();
  const { savedMatches, unsaveMatch, loading } = useMatchesAPI(userType);

  const filteredMatches = savedMatches.filter(match =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleMessage = (matchedUserId: string) => {
    navigate(`/${userType}-crm?tab=messages&contact=${matchedUserId}`);
  };

  const handleViewProfile = (matchedUserId: string) => {
    navigate(`/profile/${matchedUserId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading saved matches...</p>
      </div>
    );
  }

  if (filteredMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No saved matches</h3>
        <p className="text-muted-foreground">
          Save matches from the AI Recommendations tab to access them quickly later
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredMatches.map((match) => (
        <Card key={match.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={match.avatarUrl} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {match.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-foreground">{match.name}</h4>
                  <p className="text-xs text-muted-foreground">{match.specialty}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => unsaveMatch(match.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <Badge variant="secondary" className="text-xs">
                {match.matchScore}% match
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 text-yellow-500" />
                {match.rating.toFixed(1)}
              </span>
            </div>

            {match.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {match.genres.slice(0, 2).map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {match.notes && (
              <p className="text-xs text-muted-foreground mb-3 italic">
                "{match.notes}"
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span>Saved {formatDistanceToNow(match.savedAt, { addSuffix: true })}</span>
              {match.lastActive && (
                <span className={match.lastActive === 'Online now' ? 'text-green-500' : ''}>
                  {match.lastActive}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => handleMessage(match.matchedUserId)}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleViewProfile(match.matchedUserId)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

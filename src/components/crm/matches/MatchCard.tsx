import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, Heart, MessageCircle, Sparkles, ChevronRight,
  Clock, Award, Music, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatchProfile } from './AIMatchesHub';
import { formatDistanceToNow } from 'date-fns';

interface MatchCardProps {
  match: MatchProfile;
  userType: 'artist' | 'engineer';
  onSave: () => void;
  onContact: () => void;
  onSelect: () => void;
  isSelected?: boolean;
}

export const MatchCard = ({ 
  match, 
  userType, 
  onSave, 
  onContact, 
  onSelect,
  isSelected 
}: MatchCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (score >= 75) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
  };

  const getStatusBadge = () => {
    switch (match.status) {
      case 'contacted':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">In Contact</Badge>;
      case 'working':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Working Together</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "p-6 hover:border-primary/50 transition-all cursor-pointer group",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4 md:gap-6 flex-wrap md:flex-nowrap">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-20 h-20 md:w-24 md:h-24">
            <AvatarImage src={match.avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-2xl">
              {match.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* Match Score Badge */}
          <div className={cn(
            "absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 border-background",
            getScoreColor(match.matchScore)
          )}>
            {match.matchScore}%
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-xl md:text-2xl font-bold">{match.name}</h3>
                {getStatusBadge()}
                {match.saved && (
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{match.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  {match.completedProjects} projects
                </span>
                {match.experience > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {match.experience}+ years
                  </Badge>
                )}
                {match.lastActive && (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(match.lastActive, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            
            {match.hourlyRate && (
              <div className="text-right flex-shrink-0">
                <p className="text-2xl md:text-3xl font-bold">${match.hourlyRate}</p>
                <p className="text-sm text-muted-foreground">per track</p>
              </div>
            )}
          </div>

          {/* Compatibility Bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Genre</span>
                <span>{match.compatibilityScores.genre}%</span>
              </div>
              <Progress value={match.compatibilityScores.genre} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Style</span>
                <span>{match.compatibilityScores.style}%</span>
              </div>
              <Progress value={match.compatibilityScores.style} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Technical</span>
                <span>{match.compatibilityScores.technical}%</span>
              </div>
              <Progress value={match.compatibilityScores.technical} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Availability</span>
                <span>{match.compatibilityScores.availability}%</span>
              </div>
              <Progress value={match.compatibilityScores.availability} className="h-1.5" />
            </div>
          </div>

          {/* AI Insight */}
          {match.aiInsight && (
            <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground line-clamp-2">{match.aiInsight}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {match.specialties.slice(0, 3).map((specialty, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {match.genres.slice(0, 2).map((genre, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  <Music className="w-3 h-3 mr-1" />
                  {genre}
                </Badge>
              ))}
              {(match.specialties.length > 3 || match.genres.length > 2) && (
                <Badge variant="outline" className="text-xs">
                  +{match.specialties.length - 3 + match.genres.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={(e) => { e.stopPropagation(); onContact(); }}
              className="flex-1 min-w-[140px] bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {match.status === 'contacted' ? 'Continue Chat' : 'Start Conversation'}
            </Button>
            <Button 
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={cn(
                "transition-colors",
                match.saved && "border-pink-500 bg-pink-500/10"
              )}
            >
              <Heart 
                className={cn(
                  "w-4 h-4",
                  match.saved && "fill-pink-500 text-pink-500"
                )} 
              />
            </Button>
            <Button 
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="hidden md:flex"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

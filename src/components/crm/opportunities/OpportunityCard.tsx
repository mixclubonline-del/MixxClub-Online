import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  DollarSign,
  Clock,
  Star,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Music
} from "lucide-react";
import { useOpportunityAction } from "@/hooks/useOpportunities";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  artist: string;
  avatar: string;
  location: string;
  budget: string;
  matchScore: number;
  skills: string[];
  description: string;
  urgency: string;
  responseTime: string;
  rating: number;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  userRole: "artist" | "engineer";
  viewMode: "grid" | "list";
  isNew?: boolean;
  isUrgent?: boolean;
}

export const OpportunityCard = ({ 
  opportunity, 
  userRole, 
  viewMode,
  isNew,
  isUrgent 
}: OpportunityCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { mutate: performAction, isPending } = useOpportunityAction();

  const handleInterest = () => {
    performAction({
      opportunityId: opportunity.id,
      action: 'interested',
      userRole
    });
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-500";
    if (score >= 75) return "from-blue-500 to-cyan-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-gray-500 to-gray-600";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "low": return "bg-green-500/10 text-green-500 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (viewMode === "list") {
    return (
      <Card className={cn(
        "p-4 hover:shadow-lg transition-all duration-300",
        isUrgent && "border-red-500/30 bg-red-500/5"
      )}>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="w-14 h-14 border-2 border-background">
            <AvatarImage src={opportunity.avatar} />
            <AvatarFallback className="text-lg bg-primary/10">
              {opportunity.artist[0]}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{opportunity.title}</h3>
                  {isNew && (
                    <Badge variant="secondary" className="text-xs">NEW</Badge>
                  )}
                  {isUrgent && (
                    <Badge className="bg-red-500 text-white text-xs">URGENT</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  by {opportunity.artist}
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-1" />
                  <span>{opportunity.rating}</span>
                </p>
              </div>
              
              {/* Match Score */}
              <Badge className={cn(
                "bg-gradient-to-r text-white shrink-0",
                getMatchColor(opportunity.matchScore)
              )}>
                <Sparkles className="w-3 h-3 mr-1" />
                {opportunity.matchScore}%
              </Badge>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {opportunity.location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-500" />
                {opportunity.budget}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {opportunity.responseTime}
              </span>
            </div>

            {/* Skills */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {opportunity.skills?.slice(0, 3).map((skill, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {String(skill)}
                </Badge>
              ))}
              {opportunity.skills?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSaved(!isSaved)}
              className="shrink-0"
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
            <Button 
              onClick={handleInterest}
              disabled={isPending}
              className="shrink-0"
            >
              Apply
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-all duration-300 group",
      isUrgent && "border-red-500/30"
    )}>
      {/* Header with gradient */}
      <div className="relative h-20 bg-gradient-to-br from-primary/20 to-accent/20">
        {/* Match Score */}
        <Badge className={cn(
          "absolute top-3 right-3 bg-gradient-to-r text-white",
          getMatchColor(opportunity.matchScore)
        )}>
          <Sparkles className="w-3 h-3 mr-1" />
          {opportunity.matchScore}% Match
        </Badge>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1">
          {isNew && (
            <Badge variant="secondary" className="text-xs">NEW</Badge>
          )}
          {isUrgent && (
            <Badge className="bg-red-500 text-white text-xs">URGENT</Badge>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="absolute -bottom-6 left-4 w-12 h-12 border-2 border-background shadow-lg">
          <AvatarImage src={opportunity.avatar} />
          <AvatarFallback className="bg-primary/10">
            {opportunity.artist[0]}
          </AvatarFallback>
        </Avatar>

        {/* Save Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
          onClick={() => setIsSaved(!isSaved)}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 text-primary" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="p-4 pt-8">
        {/* Title & Artist */}
        <h3 className="font-semibold line-clamp-1">{opportunity.title}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          {opportunity.artist}
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-1" />
          <span>{opportunity.rating}</span>
        </p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {opportunity.location}
          </span>
          <span className="flex items-center gap-1 text-green-500 font-medium">
            <DollarSign className="w-3 h-3" />
            {opportunity.budget}
          </span>
        </div>

        {/* Skills */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {opportunity.skills?.slice(0, 2).map((skill, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {String(skill)}
            </Badge>
          ))}
          {opportunity.skills?.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{opportunity.skills.length - 2}
            </Badge>
          )}
        </div>

        {/* Urgency & Response Time */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Badge variant="outline" className={getUrgencyColor(opportunity.urgency)}>
            {opportunity.urgency} Priority
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {opportunity.responseTime}
          </span>
        </div>

        {/* Expandable Description */}
        {isExpanded && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
            {opportunity.description}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Less" : "Details"}
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={handleInterest}
            disabled={isPending}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
};

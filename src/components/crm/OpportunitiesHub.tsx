import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart, X, Sparkles, MapPin, Clock, DollarSign,
  Music, TrendingUp, Award, Users, Play, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOpportunities, useOpportunityAction, useMatchAnalytics } from "@/hooks/useOpportunities";

interface OpportunitiesHubProps {
  userRole?: "client" | "engineer";
}

export const OpportunitiesHub = ({ userRole = 'client' }: OpportunitiesHubProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const { data: opportunities = [], isLoading } = useOpportunities(userRole as 'artist' | 'engineer');
  const { data: analytics } = useMatchAnalytics(userRole as 'artist' | 'engineer');
  const { mutate: performAction } = useOpportunityAction();

  const currentOpportunity = opportunities[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentOpportunity) return;
    
    setSwipeDirection(direction);
    
    // Perform database action
    performAction({
      opportunityId: currentOpportunity.id,
      action: direction === 'right' ? 'interested' : 'pass',
      userRole: userRole as 'artist' | 'engineer'
    });
    
    setTimeout(() => {
      if (direction === "right") {
        toast({
          title: "Match! 💜",
          description: `You're interested in ${currentOpportunity.artist}'s project!`,
        });
      }
      
      if (currentIndex < opportunities.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setSwipeDirection(null);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading opportunities...</p>
      </div>
    );
  }

  if (!opportunities.length) {
    return (
      <Card className="p-12 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Opportunities Available</h3>
        <p className="text-muted-foreground">
          Check back later for new {userRole === 'engineer' ? 'jobs' : 'collaborations'}!
        </p>
      </Card>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "from-red-500 to-orange-500";
      case "Medium": return "from-yellow-500 to-orange-500";
      case "Low": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Compact Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI-Powered Opportunities
        </h2>
        <p className="text-muted-foreground text-sm">
          Swipe right to express interest, left to pass
        </p>
      </div>

      {/* Match Analytics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-500" />
          <p className="text-3xl font-bold">{analytics?.matches || 0}</p>
          <p className="text-sm text-muted-foreground">Matches</p>
        </Card>
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <Users className="w-8 h-8 mx-auto mb-3 text-blue-500" />
          <p className="text-3xl font-bold">{analytics?.activeChats || 0}</p>
          <p className="text-sm text-muted-foreground">Active Chats</p>
        </Card>
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <Award className="w-8 h-8 mx-auto mb-3 text-purple-500" />
          <p className="text-3xl font-bold">{analytics?.completed || 0}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </Card>
      </div>

      {/* Swipeable Card */}
      <div className="relative" style={{ minHeight: "650px" }}>
        <Card 
          className={`absolute inset-0 overflow-hidden transition-all duration-500 shadow-2xl ${
            swipeDirection === "right" ? "animate-swipe-card" :
            swipeDirection === "left" ? "animate-swipe-card-left" : ""
          }`}
        >
          {/* Match Score Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              {currentOpportunity.matchScore}% Match
            </Badge>
          </div>

          {/* Hero Section */}
          <div className="relative h-56 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Avatar className="w-36 h-36 border-4 border-background shadow-xl">
              <AvatarImage src={currentOpportunity.avatar} />
              <AvatarFallback className="text-4xl">
                {currentOpportunity.artist[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="p-8 space-y-6">
            {/* Title & Artist */}
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-2">{currentOpportunity.title}</h3>
              <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
                by {currentOpportunity.artist}
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 text-sm">{currentOpportunity.rating}</span>
                </div>
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{currentOpportunity.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">{currentOpportunity.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Replies in {currentOpportunity.responseTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`bg-gradient-to-r ${getUrgencyColor(currentOpportunity.urgency)}`}>
                  {currentOpportunity.urgency} Priority
                </Badge>
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Required Skills:</p>
              <div className="flex gap-2 flex-wrap">
                {Array.isArray(currentOpportunity.skills) && currentOpportunity.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {String(skill)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm">{currentOpportunity.description}</p>
            </div>

            {/* AI Insights */}
            <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">AI Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    Perfect match! Your style aligns with {currentOpportunity.artist}'s previous work. 
                    They typically respond within {currentOpportunity.responseTime}.
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-16 border-2 border-red-500/30 hover:bg-red-500/10"
                onClick={() => handleSwipe("left")}
              >
                <X className="w-8 h-8 text-red-500" />
              </Button>
              <Button
                size="lg"
                className="flex-1 h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => handleSwipe("right")}
              >
                <Heart className="w-8 h-8 mr-2" />
                I'm Interested!
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2">
              {opportunities.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

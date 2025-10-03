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

interface OpportunitiesHubProps {
  userRole: "client" | "engineer";
}

export const OpportunitiesHub = ({ userRole }: OpportunitiesHubProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const opportunities = [
    {
      id: 1,
      title: "Hip-Hop Track Mixing",
      artist: "Jay Rivers",
      avatar: "",
      location: "New York, US",
      budget: "$500-800",
      matchScore: 95,
      skills: ["Hip-Hop", "Mixing", "Mastering"],
      description: "Looking for an experienced engineer for my upcoming album",
      urgency: "High",
      responseTime: "4 hours",
      rating: 4.8
    },
    {
      id: 2,
      title: "EDM Mastering Project",
      artist: "Luna Beats",
      avatar: "",
      location: "Berlin, DE",
      budget: "$300-500",
      matchScore: 88,
      skills: ["EDM", "Mastering", "Sound Design"],
      description: "Need professional mastering for 3 tracks",
      urgency: "Medium",
      responseTime: "12 hours",
      rating: 4.9
    },
    {
      id: 3,
      title: "Acoustic Album Production",
      artist: "Sarah Williams",
      avatar: "",
      location: "London, UK",
      budget: "$1000-1500",
      matchScore: 92,
      skills: ["Acoustic", "Production", "Mixing"],
      description: "Full album production with 10 tracks",
      urgency: "Low",
      responseTime: "24 hours",
      rating: 5.0
    }
  ];

  const currentOpportunity = opportunities[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "from-red-500 to-orange-500";
      case "Medium": return "from-yellow-500 to-orange-500";
      case "Low": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI-Powered Opportunities
        </h2>
        <p className="text-muted-foreground">
          Swipe right to express interest, left to pass
        </p>
      </div>

      {/* Match Analytics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-muted-foreground">Matches</p>
        </Card>
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">Active Chats</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold">8</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </Card>
      </div>

      {/* Swipeable Card */}
      <div className="relative" style={{ minHeight: "600px" }}>
        <Card 
          className={`absolute inset-0 overflow-hidden transition-all duration-500 ${
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
          <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={currentOpportunity.avatar} />
              <AvatarFallback className="text-4xl">
                {currentOpportunity.artist[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="p-6 space-y-6">
            {/* Title & Artist */}
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-1">{currentOpportunity.title}</h3>
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
                {currentOpportunity.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
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

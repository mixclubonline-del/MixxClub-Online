import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Target, Zap } from "lucide-react";
import { OpportunityCard } from "./OpportunityCard";

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

interface RecommendedOpportunitiesProps {
  opportunities: Opportunity[];
  userRole: "artist" | "engineer";
  viewMode: "grid" | "list";
}

export const RecommendedOpportunities = ({ 
  opportunities, 
  userRole,
  viewMode 
}: RecommendedOpportunitiesProps) => {
  if (opportunities.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Brain className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Building Your Profile</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Complete more projects and update your profile to get AI-powered recommendations 
          tailored to your skills and style.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Banner */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-purple-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">AI-Powered Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              These opportunities are hand-picked based on your skills, past projects, 
              and collaboration style. Higher match scores indicate better compatibility.
            </p>
          </div>
        </div>
        
        {/* Match Factors */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="gap-1 bg-background/50">
            <Target className="w-3 h-3" />
            Skills Match
          </Badge>
          <Badge variant="outline" className="gap-1 bg-background/50">
            <Zap className="w-3 h-3" />
            Genre Alignment
          </Badge>
          <Badge variant="outline" className="gap-1 bg-background/50">
            <Brain className="w-3 h-3" />
            Work Style
          </Badge>
        </div>
      </Card>

      {/* Top Pick */}
      {opportunities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
              🏆 Top Pick
            </Badge>
            <span className="text-sm text-muted-foreground">
              Highest compatibility with your profile
            </span>
          </div>
          <OpportunityCard
            opportunity={opportunities[0]}
            userRole={userRole}
            viewMode="list"
          />
        </div>
      )}

      {/* Rest of Recommendations */}
      {opportunities.length > 1 && (
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground">More Recommendations</h4>
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }>
            {opportunities.slice(1).map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                userRole={userRole}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Play, Share2, Download, Archive, Sparkles,
  Clock, TrendingUp, Users, Zap, Music, ChevronRight
} from "lucide-react";

interface EnhancedProjectCardProps {
  project: {
    id: string;
    title: string;
    artist?: string;
    status: string;
    progress_percentage?: number;
    thumbnail?: string;
    xp_earned?: number;
    achievements?: string[];
    streak_days?: number;
    collaborators?: any[];
    ai_health_score?: number;
    ai_suggestions?: string[];
  };
  onStartSession?: () => void;
  onClick?: () => void;
}

export const EnhancedProjectCard = ({ project, onStartSession, onClick }: EnhancedProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "from-green-500 to-emerald-500";
      case "in_progress": return "from-blue-500 to-cyan-500";
      case "review": return "from-purple-500 to-pink-500";
      case "pending": return "from-orange-500 to-yellow-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getStatusStage = (status: string) => {
    const stages = ["Upload", "Processing", "Review", "Approved", "Released"];
    const currentIndex = {
      "pending": 0,
      "in_progress": 1,
      "review": 2,
      "completed": 3,
      "released": 4
    }[status?.toLowerCase()] || 0;
    return { stages, currentIndex };
  };

  const { stages, currentIndex } = getStatusStage(project.status);
  const healthColor = (project.ai_health_score || 0) >= 80 ? "text-green-500" : 
                      (project.ai_health_score || 0) >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(project.status)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Album Art / Thumbnail */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-20 h-20 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Floating Action Button */}
        {isHovered && (
          <Button
            size="lg"
            className="absolute bottom-4 right-4 rounded-full w-14 h-14 shadow-lg bg-primary hover:scale-110 transition-transform animate-slide-up-fade"
            onClick={(e) => {
              e.stopPropagation();
              onStartSession?.();
            }}
          >
            <Play className="w-6 h-6" />
          </Button>
        )}

        {/* XP Badge */}
        {project.xp_earned && (
          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            +{project.xp_earned} XP
          </Badge>
        )}

        {/* Streak Badge */}
        {project.streak_days && project.streak_days > 0 && (
          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500">
            🔥 {project.streak_days}d
          </Badge>
        )}
      </div>

      <div className="p-8 space-y-5">
        {/* Title & Artist */}
        <div>
          <h3 className="font-bold text-xl mb-2 line-clamp-1">{project.title}</h3>
          {project.artist && (
            <p className="text-base text-muted-foreground">{project.artist}</p>
          )}
        </div>

        {/* Status Pipeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">Progress</span>
            <span className="font-bold">{project.progress_percentage || 0}%</span>
          </div>
          <div className="flex gap-2">
            {stages.map((stage, index) => (
              <div
                key={stage}
                className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                  index <= currentIndex 
                    ? `bg-gradient-to-r ${getStatusColor(project.status)}` 
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs">
            {stages.map((stage, index) => (
              <span 
                key={stage}
                className={index <= currentIndex ? "text-primary font-medium" : "text-muted-foreground"}
              >
                {stage}
              </span>
            ))}
          </div>
        </div>

        {/* Collaboration Indicators */}
        {project.collaborators && project.collaborators.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.collaborators.slice(0, 3).map((collab: any, index: number) => (
                <Avatar key={index} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={collab.avatar} />
                  <AvatarFallback>{collab.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{project.collaborators.length} working</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        {project.ai_health_score !== undefined && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <span className={`text-sm font-bold ${healthColor}`}>
                {project.ai_health_score}%
              </span>
            </div>
            {project.ai_suggestions && project.ai_suggestions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {project.ai_suggestions[0]}
              </p>
            )}
          </div>
        )}

        {/* Achievements */}
        {project.achievements && project.achievements.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {project.achievements.slice(0, 3).map((achievement: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {achievement}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Actions Toolbar */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <Archive className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

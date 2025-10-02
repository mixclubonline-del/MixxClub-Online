import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, GraduationCap, ShoppingBag, Puzzle, Lock, Users, Sparkles } from "lucide-react";
import { useCommunityMilestones } from "@/hooks/useCommunityMilestones";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  Trophy,
  GraduationCap,
  ShoppingBag,
  Puzzle,
};

export const CommunityMilestoneTracker = () => {
  const { data: milestones, isLoading } = useCommunityMilestones();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Community Milestones</h2>
        <p className="text-muted-foreground">
          Unlock new features together as a community! 🚀
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestones.map((milestone, index) => {
          const Icon = iconMap[milestone.icon_name || "Trophy"] || Trophy;
          const isUnlocked = milestone.is_unlocked;

          return (
            <motion.div
              key={milestone.feature_key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${isUnlocked ? 'border-primary' : ''}`}>
                {isUnlocked && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
                )}
                
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-6 w-6 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{milestone.milestone_name}</h3>
                        {milestone.milestone_description && (
                          <p className="text-sm text-muted-foreground">
                            {milestone.milestone_description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {isUnlocked ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Unlocked!
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </Badge>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {milestone.current_value} / {milestone.target_value}
                      </span>
                    </div>
                    <Progress value={milestone.progress_percentage} className="h-2" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        {milestone.progress_percentage.toFixed(1)}% Complete
                      </span>
                      {milestone.contributor_count > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {milestone.contributor_count} contributors
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unlock Message */}
                  {isUnlocked && milestone.unlocked_at && (
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Unlocked {new Date(milestone.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

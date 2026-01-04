import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Trophy, 
  Users, 
  Mic2, 
  Radio, 
  ShoppingBag,
  Star,
  Flame,
  Clock
} from "lucide-react";
import { UserActivity } from "@/hooks/usePublicProfile";
import { formatDistanceToNow } from "date-fns";

interface ProfileActivityFeedProps {
  activities: UserActivity[];
  isLoading?: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
  track_released: <Music className="h-4 w-4" />,
  project_completed: <Star className="h-4 w-4" />,
  badge_earned: <Trophy className="h-4 w-4" />,
  collab_started: <Users className="h-4 w-4" />,
  went_live: <Radio className="h-4 w-4" />,
  milestone_reached: <Flame className="h-4 w-4" />,
  session_completed: <Mic2 className="h-4 w-4" />,
  sale_made: <ShoppingBag className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  track_released: "bg-primary/20 text-primary",
  project_completed: "bg-green-500/20 text-green-500",
  badge_earned: "bg-yellow-500/20 text-yellow-500",
  collab_started: "bg-blue-500/20 text-blue-500",
  went_live: "bg-red-500/20 text-red-500",
  milestone_reached: "bg-orange-500/20 text-orange-500",
  session_completed: "bg-purple-500/20 text-purple-500",
  sale_made: "bg-emerald-500/20 text-emerald-500",
};

export function ProfileActivityFeed({ activities, isLoading }: ProfileActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recent activity to show
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activityColors[activity.activity_type] || "bg-muted"}`}>
                {activityIcons[activity.activity_type] || <Star className="h-4 w-4" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{activity.title}</p>
                {activity.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    {activity.activity_type.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

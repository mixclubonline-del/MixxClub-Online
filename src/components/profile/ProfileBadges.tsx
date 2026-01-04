import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Zap, Crown, Flame, Target, Music } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileBadgesProps {
  userId: string;
}

const badgeIcons: Record<string, React.ReactNode> = {
  first_project: <Star className="h-5 w-5" />,
  five_projects: <Award className="h-5 w-5" />,
  ten_projects: <Trophy className="h-5 w-5" />,
  first_collab: <Zap className="h-5 w-5" />,
  verified: <Crown className="h-5 w-5" />,
  streak_7: <Flame className="h-5 w-5" />,
  streak_30: <Target className="h-5 w-5" />,
  first_release: <Music className="h-5 w-5" />,
};

const rarityColors: Record<string, string> = {
  common: "bg-secondary text-secondary-foreground",
  uncommon: "bg-green-500/20 text-green-400 border-green-500/50",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  legendary: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/50",
};

export function ProfileBadges({ userId }: ProfileBadgesProps) {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No achievements earned yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
          <Badge variant="secondary" className="ml-2">{achievements.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`relative p-4 rounded-xl border text-center transition-transform hover:scale-105 ${
                rarityColors[badge.badge_type || "common"] || rarityColors.common
              }`}
            >
              <div className="flex justify-center mb-2">
                {badge.icon ? (
                  <span className="text-2xl">{badge.icon}</span>
                ) : (
                  badgeIcons[badge.achievement_type] || <Award className="h-6 w-6" />
                )}
              </div>
              <p className="text-xs font-medium truncate">{badge.badge_name || badge.title}</p>
              {badge.badge_type && (
                <p className="text-[10px] text-muted-foreground capitalize mt-1">
                  {badge.badge_type}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

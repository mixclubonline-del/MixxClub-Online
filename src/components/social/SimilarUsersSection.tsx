import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useSuggestedUsers } from "@/hooks/useSuggestedUsers";
import { FollowButton } from "@/components/profile/FollowButton";
import { Link } from "react-router-dom";

interface SimilarUsersSectionProps {
  userId: string;
  userRole?: string | null;
  className?: string;
}

export function SimilarUsersSection({ userId, userRole, className }: SimilarUsersSectionProps) {
  const { suggestedUsers, isLoading } = useSuggestedUsers({
    limit: 6,
    excludeUserId: userId,
    preferRole: userRole === "artist" ? "artist" : userRole === "engineer" ? "engineer" : undefined,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Similar Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Similar Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Link to={`/u/${user.username}`}>
                <Avatar className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="text-center">
                <Link
                  to={`/u/${user.username}`}
                  className="font-medium text-sm hover:text-primary transition-colors block truncate max-w-[120px]"
                >
                  {user.full_name || user.username}
                </Link>
                <span className="text-xs text-muted-foreground">
                  @{user.username}
                </span>
              </div>
              {user.role && (
                <Badge variant="secondary" className="text-xs">
                  {user.role}
                </Badge>
              )}
              <FollowButton userId={user.id} size="sm" showIcon={false} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, UserPlus } from "lucide-react";
import { useSuggestedUsers } from "@/hooks/useSuggestedUsers";
import { FollowButton } from "@/components/profile/FollowButton";
import { Link } from "react-router-dom";

interface WhoToFollowWidgetProps {
  limit?: number;
  className?: string;
}

export function WhoToFollowWidget({ limit = 5, className }: WhoToFollowWidgetProps) {
  const { suggestedUsers, isLoading, refetch } = useSuggestedUsers({ limit });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Who to Follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Who to Follow
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Link to={`/u/${user.username}`}>
              <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link 
                to={`/u/${user.username}`}
                className="font-medium text-sm hover:text-primary transition-colors truncate block"
              >
                {user.full_name || user.username}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  @{user.username}
                </span>
                {user.role && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
            <FollowButton userId={user.id} size="sm" showIcon={false} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

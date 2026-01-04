import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useSocialGraph } from "@/hooks/useSocialGraph";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { PostFollowSuggestions } from "@/components/social/PostFollowSuggestions";

interface FollowButtonProps {
  userId: string;
  username?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  username,
  variant = "default",
  size = "default",
  showIcon = true,
  showSuggestions = true,
  className,
}: FollowButtonProps) {
  const { user } = useAuth();
  const {
    isFollowing,
    isCheckingFollow,
    followUser,
    unfollowUser,
    isFollowPending,
    isUnfollowPending,
  } = useSocialGraph(userId);

  const [showPostFollowDialog, setShowPostFollowDialog] = useState(false);

  // Don't show button for own profile or if not logged in
  if (!user || user.id === userId) return null;

  const isPending = isFollowPending || isUnfollowPending;
  const isLoading = isCheckingFollow || isPending;

  const handleClick = () => {
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId, {
        onSuccess: () => {
          if (showSuggestions) {
            setShowPostFollowDialog(true);
          }
        },
      });
    }
  };

  return (
    <>
      <Button
        variant={isFollowing ? "outline" : variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "transition-all duration-200",
          isFollowing && "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {showIcon && (
              isFollowing ? (
                <UserMinus className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )
            )}
            {isFollowing ? "Following" : "Follow"}
          </>
        )}
      </Button>

      <PostFollowSuggestions
        open={showPostFollowDialog}
        onOpenChange={setShowPostFollowDialog}
        followedUserId={userId}
        followedUsername={username}
      />
    </>
  );
}

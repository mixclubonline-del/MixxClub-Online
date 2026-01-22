import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2, Sparkles } from "lucide-react";
import { useSocialGraph } from "@/hooks/useSocialGraph";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { PostFollowSuggestions } from "@/components/social/PostFollowSuggestions";
import { usePotentialDay1, useDay1Status, getTierIcon } from "@/hooks/useDay1Status";
import { Day1Badge } from "@/components/day1/Day1Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FollowButtonProps {
  userId: string;
  username?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showSuggestions?: boolean;
  showDay1Opportunity?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  username,
  variant = "default",
  size = "default",
  showIcon = true,
  showSuggestions = true,
  showDay1Opportunity = true,
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
  
  // Day 1 status tracking
  const { day1Record, isDay1, followerRank } = useDay1Status(userId);
  const { potentialRank, potentialTier, isDay1Opportunity } = usePotentialDay1(userId);

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

  // Show Day 1 badge if already following and is a Day 1
  if (isFollowing && isDay1 && day1Record) {
    return (
      <div className="flex items-center gap-2">
        <Day1Badge 
          tier={day1Record.recognition_tier as any} 
          followerRank={followerRank ?? undefined}
          compact 
        />
        <Button
          variant="outline"
          size={size}
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "transition-all duration-200",
            "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {showIcon && <UserMinus className="h-4 w-4 mr-2" />}
              Following
            </>
          )}
        </Button>
        <PostFollowSuggestions
          open={showPostFollowDialog}
          onOpenChange={setShowPostFollowDialog}
          followedUserId={userId}
          followedUsername={username}
        />
      </div>
    );
  }

  // Regular following state (not Day 1)
  if (isFollowing) {
    return (
      <>
        <Button
          variant="outline"
          size={size}
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "transition-all duration-200",
            "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {showIcon && <UserMinus className="h-4 w-4 mr-2" />}
              Following
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

  // Not following - show Day 1 opportunity if applicable
  const tierIcon = isDay1Opportunity ? getTierIcon(potentialTier) : null;

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        {showDay1Opportunity && isDay1Opportunity && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-primary animate-pulse">
                <Sparkles className="h-3 w-3" />
                <span>Be #{potentialRank} {tierIcon}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Follow now to become a Day 1 supporter!</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Button
          variant={isDay1Opportunity ? "default" : variant}
          size={size}
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "transition-all duration-200",
            isDay1Opportunity && "bg-gradient-to-r from-primary to-primary/80",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {showIcon && <UserPlus className="h-4 w-4 mr-2" />}
              {isDay1Opportunity ? "Be Day 1" : "Follow"}
            </>
          )}
        </Button>
      </div>

      <PostFollowSuggestions
        open={showPostFollowDialog}
        onOpenChange={setShowPostFollowDialog}
        followedUserId={userId}
        followedUsername={username}
      />
    </>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, X, Sparkles } from "lucide-react";
import { useSuggestedUsers } from "@/hooks/useSuggestedUsers";
import { useSocialGraph } from "@/hooks/useSocialGraph";
import { Link } from "react-router-dom";

interface PostFollowSuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followedUserId: string;
  followedUsername?: string;
}

export function PostFollowSuggestions({
  open,
  onOpenChange,
  followedUserId,
  followedUsername,
}: PostFollowSuggestionsProps) {
  const { suggestedUsers, isLoading } = useSuggestedUsers({ 
    limit: 3, 
    excludeUserId: followedUserId 
  });
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const handleFollowSuccess = (userId: string) => {
    setFollowingIds(prev => new Set([...prev, userId]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            People also follow
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Users who follow {followedUsername ? `@${followedUsername}` : "this user"} also follow:
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : suggestedUsers.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No suggestions available right now
          </p>
        ) : (
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <SuggestionRow
                key={user.id}
                user={user}
                isFollowed={followingIds.has(user.id)}
                onFollowSuccess={() => handleFollowSuccess(user.id)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SuggestionRowProps {
  user: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    follower_count: number | null;
  };
  isFollowed: boolean;
  onFollowSuccess: () => void;
}

function SuggestionRow({ user, isFollowed, onFollowSuccess }: SuggestionRowProps) {
  const { followUser, isFollowPending } = useSocialGraph(user.id);

  const handleFollow = () => {
    followUser(user.id, {
      onSuccess: () => onFollowSuccess(),
    });
  };

  const displayName = user.full_name || user.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Link to={`/u/${user.username || user.id}`} className="flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link 
          to={`/u/${user.username || user.id}`}
          className="font-medium text-sm hover:underline truncate block"
        >
          {displayName}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {user.username && <span>@{user.username}</span>}
          {user.role && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {user.role}
            </Badge>
          )}
        </div>
      </div>

      <Button
        size="sm"
        variant={isFollowed ? "outline" : "default"}
        onClick={handleFollow}
        disabled={isFollowPending || isFollowed}
        className="flex-shrink-0"
      >
        {isFollowPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowed ? (
          "Following"
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-1" />
            Follow
          </>
        )}
      </Button>
    </div>
  );
}

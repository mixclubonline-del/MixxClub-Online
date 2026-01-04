import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./FollowButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BadgeCheck, Loader2 } from "lucide-react";
import { FollowUser } from "@/hooks/useSocialGraph";
import { useNavigate } from "react-router-dom";

interface FollowersListProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  isLoading?: boolean;
}

export function FollowersList({ 
  isOpen, 
  onClose, 
  title, 
  users, 
  isLoading = false 
}: FollowersListProps) {
  const navigate = useNavigate();

  const handleUserClick = (user: FollowUser) => {
    if (user.username) {
      navigate(`/u/${user.username}`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users to show
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.full_name?.[0] || user.username?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium truncate">
                          {user.full_name || user.username || "Anonymous"}
                        </span>
                        {user.is_verified && (
                          <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      {user.username && (
                        <p className="text-sm text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      )}
                      {user.tagline && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.tagline}
                        </p>
                      )}
                    </div>
                  </button>

                  <FollowButton 
                    userId={user.id} 
                    variant="outline" 
                    size="sm" 
                    showIcon={false}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePresence } from '@/hooks/useRealtime';
import { Users } from 'lucide-react';

export function OnlineUsersWidget() {
  const { users, userCount } = usePresence('admin-presence');

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Online Now</h3>
        <Badge variant="secondary" className="ml-auto">
          {userCount}
        </Badge>
      </div>

      <div className="space-y-3">
        {Object.entries(users).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No users online</p>
          </div>
        ) : (
          Object.entries(users).map(([key, presences]: [string, any]) => {
            const presence = Array.isArray(presences) ? presences[0] : presences;
            return (
              <div
                key={key}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>
                      {presence.user_id?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    User {presence.user_id?.substring(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active now
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

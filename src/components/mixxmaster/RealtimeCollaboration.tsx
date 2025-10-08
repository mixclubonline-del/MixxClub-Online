import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, WifiOff, Activity } from 'lucide-react';
import { useMixxMasterRealtime } from '@/hooks/useMixxMasterRealtime';

interface RealtimeCollaborationProps {
  sessionId: string;
}

export const RealtimeCollaboration = ({ sessionId }: RealtimeCollaborationProps) => {
  const { session, isConnected } = useMixxMasterRealtime(sessionId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Live Collaboration
          <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-auto">
            {isConnected ? (
              <><Wifi className="h-3 w-3 mr-1" /> Connected</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> Disconnected</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last update: {new Date(session.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Users</p>
              {session.activeUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {session.activeUsers.map((user) => (
                    <Badge key={user} variant="outline">
                      {user}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No other users online</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Session Info</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <span className="ml-2">{session.manifest.version}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Project:</span>
                  <span className="ml-2">{session.manifest.metadata.artistInfo.projectName}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading session data...</p>
        )}
      </CardContent>
    </Card>
  );
};

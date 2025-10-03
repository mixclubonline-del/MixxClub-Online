import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRealtime } from '@/hooks/useRealtime';
import { Activity, Users, Database, Shield, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  id: string;
  type: 'user_action' | 'system_event' | 'security_alert' | 'data_change';
  title: string;
  description: string;
  userId?: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function RealtimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const { isConnected, events, broadcast } = useRealtime({
    channel: 'admin-activity',
    event: 'activity',
    onMessage: (event) => {
      if (event.payload) {
        setActivities((prev) => [event.payload, ...prev.slice(0, 49)]);
      }
    },
  });

  // Simulate some initial activities for demo
  useEffect(() => {
    const initialActivities: ActivityEvent[] = [
      {
        id: '1',
        type: 'user_action',
        title: 'User Login',
        description: 'John Doe logged into the system',
        timestamp: new Date().toISOString(),
        severity: 'low',
      },
      {
        id: '2',
        type: 'data_change',
        title: 'Database Update',
        description: 'Project status updated to completed',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        severity: 'low',
      },
      {
        id: '3',
        type: 'system_event',
        title: 'System Backup',
        description: 'Automated backup completed successfully',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        severity: 'low',
      },
    ];
    setActivities(initialActivities);
  }, []);

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'user_action':
        return Users;
      case 'system_event':
        return Zap;
      case 'security_alert':
        return Shield;
      case 'data_change':
        return Database;
      default:
        return Activity;
    }
  };

  const getSeverityColor = (severity?: ActivityEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Activity Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No activity yet</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <Card
                  key={activity.id}
                  className="p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {activity.title}
                        </span>
                        {activity.severity && (
                          <Badge
                            variant={getSeverityColor(activity.severity)}
                            className="text-xs"
                          >
                            {activity.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(activity.timestamp), 'PPp')}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

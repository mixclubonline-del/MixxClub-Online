import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles, Music, MessageSquare } from 'lucide-react';

interface Activity {
  id: string;
  type: 'match' | 'message' | 'project';
  title: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: any[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return Sparkles;
      case 'message': return MessageSquare;
      case 'project': return Music;
      default: return Music;
    }
  };

  return (
    <Card variant="glass-ember" hover="glow">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No recent activity. Start collaborating to see updates here!
          </p>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.status || 'match');
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New match with {activity.match_score}% compatibility</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

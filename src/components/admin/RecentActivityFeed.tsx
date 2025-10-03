import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'user' | 'payment' | 'content' | 'system';
}

const recentActivities: ActivityItem[] = [
  {
    id: '1',
    user: 'John Smith',
    action: 'created',
    target: 'new admin API key',
    timestamp: '2 minutes ago',
    type: 'system'
  },
  {
    id: '2',
    user: 'Sarah Johnson',
    action: 'approved',
    target: 'engineer verification for Mike Davis',
    timestamp: '15 minutes ago',
    type: 'user'
  },
  {
    id: '3',
    user: 'System',
    action: 'processed',
    target: 'monthly subscription payments',
    timestamp: '1 hour ago',
    type: 'payment'
  },
  {
    id: '4',
    user: 'Mike Davis',
    action: 'removed',
    target: 'flagged content',
    timestamp: '2 hours ago',
    type: 'content'
  },
  {
    id: '5',
    user: 'John Smith',
    action: 'updated',
    target: 'RLS security policies',
    timestamp: '3 hours ago',
    type: 'system'
  },
  {
    id: '6',
    user: 'Sarah Johnson',
    action: 'refunded',
    target: 'payment #1234 ($150)',
    timestamp: '4 hours ago',
    type: 'payment'
  }
];

export function RecentActivityFeed() {
  const getTypeBadge = (type: ActivityItem['type']) => {
    const variants: Record<string, any> = {
      user: 'default',
      payment: 'default',
      content: 'secondary',
      system: 'outline'
    };
    return variants[type] || 'outline';
  };

  const getTypeColor = (type: ActivityItem['type']) => {
    const colors: Record<string, string> = {
      user: 'bg-blue-500',
      payment: 'bg-green-500',
      content: 'bg-purple-500',
      system: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest administrative actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage />
                <AvatarFallback className={getTypeColor(activity.type)}>
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{activity.user}</span>
                  <Badge variant={getTypeBadge(activity.type)} className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action} <span className="font-medium">{activity.target}</span>
                </p>
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

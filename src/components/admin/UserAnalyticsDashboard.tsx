import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, TrendingUp, TrendingDown, UserPlus, UserMinus, 
  Clock, Activity, Target
} from "lucide-react";

interface UserMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
}

const userMetrics: UserMetric[] = [
  {
    label: 'Total Users',
    value: '12,543',
    change: '+8.2%',
    trend: 'up',
    icon: Users
  },
  {
    label: 'New Users (30d)',
    value: '1,287',
    change: '+12.5%',
    trend: 'up',
    icon: UserPlus
  },
  {
    label: 'Active Users (7d)',
    value: '8,234',
    change: '+5.3%',
    trend: 'up',
    icon: Activity
  },
  {
    label: 'Churn Rate',
    value: '2.4%',
    change: '-0.8%',
    trend: 'up',
    icon: UserMinus
  },
  {
    label: 'Avg Session Duration',
    value: '24m 32s',
    change: '+3.2%',
    trend: 'up',
    icon: Clock
  },
  {
    label: 'User Retention (30d)',
    value: '78.5%',
    change: '+2.1%',
    trend: 'up',
    icon: Target
  }
];

const userSegments = [
  { name: 'Free Tier', count: 8234, percentage: 65.6, color: 'bg-blue-500' },
  { name: 'Basic Plan', count: 2845, percentage: 22.7, color: 'bg-green-500' },
  { name: 'Pro Plan', count: 1234, percentage: 9.8, color: 'bg-purple-500' },
  { name: 'Enterprise', count: 230, percentage: 1.9, color: 'bg-orange-500' }
];

const topActions = [
  { action: 'Project Creation', count: 3456, growth: '+15.2%' },
  { action: 'File Uploads', count: 12890, growth: '+8.7%' },
  { action: 'Profile Updates', count: 2345, growth: '+5.3%' },
  { action: 'Payment Transactions', count: 892, growth: '+18.9%' },
  { action: 'Message Sent', count: 8734, growth: '+12.4%' }
];

const engagementData = [
  { day: 'Mon', active: 6234, engaged: 4123 },
  { day: 'Tue', active: 6789, engaged: 4456 },
  { day: 'Wed', active: 7234, engaged: 4789 },
  { day: 'Thu', active: 7890, engaged: 5234 },
  { day: 'Fri', active: 8234, engaged: 5567 },
  { day: 'Sat', active: 5678, engaged: 3234 },
  { day: 'Sun', active: 5234, engaged: 2890 }
];

export function UserAnalyticsDashboard() {
  const getTrendIcon = (trend: UserMetric['trend']) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{metric.label}</CardDescription>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  {getTrendIcon(metric.trend)}
                  <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Segments */}
        <Card>
          <CardHeader>
            <CardTitle>User Segments</CardTitle>
            <CardDescription>Distribution by subscription tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userSegments.map((segment) => (
              <div key={segment.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{segment.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {segment.count.toLocaleString()} users
                    </span>
                    <Badge variant="outline">{segment.percentage}%</Badge>
                  </div>
                </div>
                <Progress value={segment.percentage} className={`h-2 [&>div]:${segment.color}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top User Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Top User Actions (30d)</CardTitle>
            <CardDescription>Most performed actions by users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topActions.map((item, index) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.action}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count.toLocaleString()} times
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {item.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Engagement</CardTitle>
          <CardDescription>Active vs engaged users over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engagementData.map((data) => (
              <div key={data.day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium w-12">{data.day}</span>
                  <div className="flex-1 ml-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress 
                          value={(data.active / 8234) * 100} 
                          className="h-2 [&>div]:bg-blue-500"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {data.active.toLocaleString()} active
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress 
                          value={(data.engaged / 8234) * 100} 
                          className="h-2 [&>div]:bg-green-500"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {data.engaged.toLocaleString()} engaged
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Engaged Users</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

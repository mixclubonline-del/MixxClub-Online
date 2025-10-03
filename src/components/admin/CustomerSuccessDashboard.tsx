import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, UserCheck, UserX, Award } from "lucide-react";

const retentionData = [
  { month: 'Jan', rate: 85 },
  { month: 'Feb', rate: 87 },
  { month: 'Mar', rate: 89 },
  { month: 'Apr', rate: 91 },
  { month: 'May', rate: 93 },
  { month: 'Jun', rate: 94 },
];

const userJourneyMetrics = [
  { stage: 'Sign Up', users: 1250, completion: 100 },
  { stage: 'Email Verified', users: 1100, completion: 88 },
  { stage: 'Profile Completed', users: 950, completion: 76 },
  { stage: 'First Project', users: 720, completion: 58 },
  { stage: 'Active User', users: 580, completion: 46 },
];

const healthScores = [
  { name: 'Power Users', score: 95, count: 145, trend: 'up' },
  { name: 'Regular Users', score: 78, count: 420, trend: 'up' },
  { name: 'At Risk', score: 45, count: 85, trend: 'down' },
  { name: 'Churned', score: 15, count: 32, trend: 'down' },
];

export function CustomerSuccessDashboard() {
  const getTrendIcon = (trend: string) => {
    return trend === 'up' 
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Retention Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">94%</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>+2.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Activation Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58%</div>
            <div className="text-sm text-muted-foreground mt-1">
              720 completed onboarding
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Health Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">82</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>+5.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Retention Trend</CardTitle>
            <CardDescription>Monthly user retention rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[80, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Health Segments</CardTitle>
            <CardDescription>Distribution by engagement level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthScores.map((segment) => (
              <div key={segment.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{segment.name}</span>
                    {getTrendIcon(segment.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getHealthColor(segment.score)}`}>
                      {segment.score}
                    </span>
                    <Badge variant="outline">{segment.count} users</Badge>
                  </div>
                </div>
                <Progress value={segment.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Journey Funnel</CardTitle>
          <CardDescription>Conversion through onboarding stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userJourneyMetrics.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{stage.users} users</span>
                    <Badge variant={stage.completion > 70 ? 'default' : 'secondary'}>
                      {stage.completion}%
                    </Badge>
                  </div>
                </div>
                <Progress value={stage.completion} className="h-2" />
                {index < userJourneyMetrics.length - 1 && (
                  <div className="text-xs text-red-500 ml-2">
                    ↓ {userJourneyMetrics[index].users - userJourneyMetrics[index + 1].users} drop-off
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Star, DollarSign, BarChart3, PieChart } from 'lucide-react';

interface SessionAnalyticsProps {
  userType: 'artist' | 'engineer';
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ userType }) => {
  const monthlyStats = {
    sessions: 12,
    totalHours: 48,
    avgRating: 4.8,
    earnings: userType === 'engineer' ? 3240 : undefined,
    completionRate: 92,
  };

  const genreDistribution = [
    { genre: 'Hip-Hop', percentage: 45, count: 21 },
    { genre: 'R&B', percentage: 25, count: 12 },
    { genre: 'Trap', percentage: 18, count: 8 },
    { genre: 'Drill', percentage: 12, count: 6 },
  ];

  const weeklyTrend = [
    { week: 'Week 1', sessions: 3, hours: 12 },
    { week: 'Week 2', sessions: 4, hours: 16 },
    { week: 'Week 3', sessions: 2, hours: 8 },
    { week: 'Week 4', sessions: 3, hours: 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Monthly Sessions</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{monthlyStats.sessions}</p>
            <p className="text-xs text-green-500 mt-1">+20% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Hours</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{monthlyStats.totalHours}h</p>
            <p className="text-xs text-muted-foreground mt-1">Avg 4h per session</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Avg Rating</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{monthlyStats.avgRating}</p>
            <p className="text-xs text-muted-foreground mt-1">Top 10% of platform</p>
          </CardContent>
        </Card>

        {monthlyStats.earnings && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Monthly Earnings</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${monthlyStats.earnings}</p>
              <p className="text-xs text-green-500 mt-1">+15% from last month</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Genre Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {genreDistribution.map((item) => (
              <div key={item.genre}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{item.genre}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.count} sessions ({item.percentage}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyTrend.map((week, index) => (
                <div key={week.week} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-16">{week.week}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div 
                      className="h-8 bg-primary/20 rounded flex items-center justify-end px-2"
                      style={{ width: `${(week.sessions / 4) * 100}%` }}
                    >
                      <span className="text-xs text-primary font-medium">{week.sessions}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-12">{week.hours}h</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium text-foreground">{monthlyStats.completionRate}%</span>
              </div>
              <Progress value={monthlyStats.completionRate} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

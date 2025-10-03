import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, MousePointer, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const UserBehaviorAnalytics = () => {
  const { data: behaviorData, isLoading } = useQuery({
    queryKey: ["user-behavior"],
    queryFn: async () => {
      // Mock behavior data
      return {
        totalSessions: 12450,
        avgSessionDuration: 8.5,
        bounceRate: 24.5,
        topPages: [
          { page: "/dashboard", views: 4520, avgTime: 12.3 },
          { page: "/projects", views: 3210, avgTime: 9.8 },
          { page: "/engineer-crm", views: 2840, avgTime: 15.2 },
        ],
        featureUsage: [
          { feature: "Project Creation", usage: 87 },
          { feature: "File Upload", usage: 76 },
          { feature: "Collaboration", usage: 45 },
          { feature: "Export", usage: 32 },
        ],
      };
    },
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          User Behavior Analytics
        </CardTitle>
        <CardDescription>Session tracking, heatmaps, and feature usage statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="space-y-2">
              <Users className="h-6 w-6 text-primary" />
              <div className="text-2xl font-bold">{behaviorData?.totalSessions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div className="text-2xl font-bold">{behaviorData?.avgSessionDuration} min</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <MousePointer className="h-6 w-6 text-blue-500" />
              <div className="text-2xl font-bold">{behaviorData?.bounceRate}%</div>
              <div className="text-sm text-muted-foreground">Bounce Rate</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Eye className="h-6 w-6 text-purple-500" />
              <div className="text-2xl font-bold">
                {behaviorData?.topPages.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Page Views</div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Top Pages</h3>
          <div className="space-y-3">
            {behaviorData?.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="font-medium font-mono text-sm">{page.page}</div>
                  <div className="text-sm text-muted-foreground">
                    {page.views.toLocaleString()} views • {page.avgTime} min avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Feature Usage</h3>
          <div className="space-y-3">
            {behaviorData?.featureUsage.map((feature, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{feature.feature}</span>
                  <span className="font-medium">{feature.usage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};

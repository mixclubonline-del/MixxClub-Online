import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const LTVAnalysis = () => {
  const { data: ltvData, isLoading } = useQuery({
    queryKey: ["ltv-analysis"],
    queryFn: async () => {
      // Mock LTV data
      return {
        averageLTV: 1250,
        ltvCACRatio: 3.2,
        cohorts: [
          { month: "Jan 2024", customers: 45, avgLTV: 1180, retention: 92 },
          { month: "Dec 2023", customers: 52, avgLTV: 1320, retention: 88 },
          { month: "Nov 2023", customers: 48, avgLTV: 1240, retention: 85 },
        ],
        topSegments: [
          { segment: "Enterprise", ltv: 3500, customers: 12 },
          { segment: "Professional", ltv: 1800, customers: 45 },
          { segment: "Starter", ltv: 680, customers: 120 },
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
          <TrendingUp className="h-5 w-5" />
          Customer Lifetime Value Analysis
        </CardTitle>
        <CardDescription>LTV metrics, cohort analysis, and segment performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="space-y-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div className="text-2xl font-bold">${ltvData?.averageLTV}</div>
              <div className="text-sm text-muted-foreground">Average LTV</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div className="text-2xl font-bold">{ltvData?.ltvCACRatio}:1</div>
              <div className="text-sm text-muted-foreground">LTV:CAC Ratio</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Users className="h-6 w-6 text-blue-500" />
              <div className="text-2xl font-bold">
                {ltvData?.cohorts.reduce((sum, c) => sum + c.customers, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cohort Analysis
          </h3>
          <div className="space-y-3">
            {ltvData?.cohorts.map((cohort, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{cohort.month}</div>
                  <div className="text-sm text-muted-foreground">
                    {cohort.customers} customers • {cohort.retention}% retention
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${cohort.avgLTV}</div>
                  <div className="text-xs text-muted-foreground">Avg LTV</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Top Segments by LTV</h3>
          <div className="space-y-3">
            {ltvData?.topSegments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{segment.segment}</div>
                  <div className="text-sm text-muted-foreground">
                    {segment.customers} customers
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">${segment.ltv}</div>
              </div>
            ))}
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};

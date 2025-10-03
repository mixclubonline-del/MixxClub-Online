import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Calendar, DollarSign, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const RevenueForecasting = () => {
  const { data: forecastData, isLoading } = useQuery({
    queryKey: ["revenue-forecast"],
    queryFn: async () => {
      // Mock forecast data
      return {
        currentMRR: 45600,
        projectedARR: 625000,
        growthRate: 15.2,
        forecast: [
          { month: "Feb 2024", mrr: 48200, confidence: 95 },
          { month: "Mar 2024", mrr: 51500, confidence: 92 },
          { month: "Apr 2024", mrr: 54800, confidence: 88 },
          { month: "May 2024", mrr: 58400, confidence: 82 },
        ],
        seasonality: {
          q1: 1.05,
          q2: 1.15,
          q3: 0.95,
          q4: 1.25,
        },
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
          <BarChart3 className="h-5 w-5" />
          Revenue Forecasting
        </CardTitle>
        <CardDescription>MRR/ARR projections and growth predictions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="space-y-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div className="text-2xl font-bold">${forecastData?.currentMRR.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Current MRR</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div className="text-2xl font-bold">${(forecastData?.projectedARR || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Projected ARR</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <div className="text-2xl font-bold">{forecastData?.growthRate}%</div>
              <div className="text-sm text-muted-foreground">Monthly Growth</div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Revenue Forecast (Next 4 Months)
          </h3>
          <div className="space-y-3">
            {forecastData?.forecast.map((period, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{period.month}</div>
                  <div className="text-sm text-muted-foreground">
                    {period.confidence}% confidence
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${period.mrr.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    +{((period.mrr / (forecastData?.currentMRR || 1) - 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Seasonality Impact</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(forecastData?.seasonality || {}).map(([quarter, multiplier]) => (
              <div key={quarter} className="p-3 bg-muted rounded-lg text-center">
                <div className="text-sm text-muted-foreground uppercase">{quarter}</div>
                <div className="text-xl font-bold mt-1">
                  {((multiplier - 1) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Q4 typically shows strongest performance with 25% above baseline
          </p>
        </Card>
      </CardContent>
    </Card>
  );
};

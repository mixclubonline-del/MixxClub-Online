import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TestTube, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PricingOptimization = () => {
  const { toast } = useToast();

  const experiments = [
    {
      name: "Premium Plan +$10",
      status: "running",
      conversions: 45,
      revenue: 2250,
      confidence: 87,
    },
    {
      name: "Starter Plan -$5",
      status: "completed",
      conversions: 120,
      revenue: 3600,
      confidence: 95,
    },
  ];

  const recommendations = [
    {
      title: "Increase Premium Tier",
      description: "Data shows 32% of premium users would accept a $15 price increase",
      impact: "+$4,800/month",
      confidence: "High",
    },
    {
      title: "Introduce Annual Discount",
      description: "15% discount on annual plans could increase annual conversions by 45%",
      impact: "+$12,000/year",
      confidence: "Medium",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Optimization
        </CardTitle>
        <CardDescription>A/B tests and pricing recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Active Experiments
          </h3>
          {experiments.map((exp, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{exp.name}</h4>
                    <Badge variant={exp.status === "running" ? "default" : "secondary"}>
                      {exp.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Conversions</div>
                      <div className="font-medium">{exp.conversions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Revenue</div>
                      <div className="font-medium">${exp.revenue}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="font-medium">{exp.confidence}%</div>
                    </div>
                  </div>
                </div>
                {exp.status === "running" && (
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommendations
          </h3>
          {recommendations.map((rec, index) => (
            <Card key={index} className="p-4 border-l-4 border-l-primary">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge>{rec.confidence} Confidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-bold text-green-600">{rec.impact}</div>
                  <Button
                    size="sm"
                    onClick={() =>
                      toast({
                        title: "Test created",
                        description: `A/B test for "${rec.title}" has been initiated`,
                      })
                    }
                  >
                    Start A/B Test
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

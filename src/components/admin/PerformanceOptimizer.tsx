import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2 } from "lucide-react";

export const PerformanceOptimizer = () => {
  const optimizations = [
    { name: "Code Splitting", status: "active", impact: "High" },
    { name: "Lazy Loading", status: "active", impact: "High" },
    { name: "Database Indexes", status: "active", impact: "Medium" },
    { name: "Image Optimization", status: "pending", impact: "Medium" },
    { name: "CDN Integration", status: "pending", impact: "High" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <CardTitle>Performance Status</CardTitle>
        </div>
        <CardDescription>Optimization techniques active</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {optimizations.map((opt) => (
            <div key={opt.name} className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center gap-2">
                {opt.status === "active" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                <span className="text-sm">{opt.name}</span>
              </div>
              <Badge variant={opt.status === "active" ? "default" : "secondary"}>
                {opt.impact} Impact
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Users, Database, TrendingUp } from "lucide-react";

export const TenantAnalytics = () => {
  const tenants = [
    { name: "Acme Studios", users: 45, storage: 12.5, revenue: 4500, growth: 15 },
    { name: "Beta Records", users: 23, storage: 8.2, revenue: 2300, growth: 8 },
    { name: "Gamma Productions", users: 67, storage: 25.3, revenue: 6700, growth: 22 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tenant Analytics
        </CardTitle>
        <CardDescription>Usage statistics and performance metrics per tenant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tenants.map((tenant, index) => (
          <Card key={index} className="p-4">
            <h4 className="font-medium mb-4">{tenant.name}</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Users</span>
                </div>
                <div className="text-xl font-bold">{tenant.users}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Database className="h-4 w-4" />
                  <span className="text-xs">Storage</span>
                </div>
                <div className="text-xl font-bold">{tenant.storage} GB</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Revenue</span>
                </div>
                <div className="text-xl font-bold">${tenant.revenue}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Growth</span>
                </div>
                <div className="text-xl font-bold text-green-600">+{tenant.growth}%</div>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

const DollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

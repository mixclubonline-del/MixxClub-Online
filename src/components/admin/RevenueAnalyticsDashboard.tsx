import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard, 
  Repeat, Target, ArrowUpRight, ArrowDownRight
} from "lucide-react";

interface RevenueMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

const revenueMetrics: RevenueMetric[] = [
  {
    label: 'Total Revenue (30d)',
    value: '$127,450',
    change: '+18.2%',
    trend: 'up',
    icon: DollarSign
  },
  {
    label: 'MRR',
    value: '$43,200',
    change: '+12.5%',
    trend: 'up',
    icon: Repeat
  },
  {
    label: 'ARR',
    value: '$518,400',
    change: '+12.5%',
    trend: 'up',
    icon: Target
  },
  {
    label: 'Avg Transaction Value',
    value: '$156.23',
    change: '+5.7%',
    trend: 'up',
    icon: CreditCard
  },
  {
    label: 'Payment Success Rate',
    value: '97.8%',
    change: '+1.2%',
    trend: 'up',
    icon: TrendingUp
  },
  {
    label: 'Refund Rate',
    value: '1.4%',
    change: '-0.3%',
    trend: 'up',
    icon: TrendingDown
  }
];

const revenueByPlan = [
  { plan: 'Basic Plan', revenue: 45600, transactions: 1820, color: 'bg-blue-500' },
  { plan: 'Pro Plan', revenue: 62400, transactions: 520, color: 'bg-purple-500' },
  { plan: 'Enterprise', revenue: 19450, transactions: 23, color: 'bg-orange-500' }
];

const topProducts = [
  { name: 'Mixing Service', revenue: 52340, sales: 892, avgPrice: 58.70 },
  { name: 'Mastering Package', revenue: 34200, sales: 570, avgPrice: 60.00 },
  { name: 'Pro Subscription', revenue: 26800, sales: 268, avgPrice: 100.00 },
  { name: 'Distribution Service', revenue: 14110, sales: 314, avgPrice: 44.93 }
];

const monthlyRevenue = [
  { month: 'Jun', revenue: 98500, target: 100000 },
  { month: 'Jul', revenue: 105300, target: 105000 },
  { month: 'Aug', revenue: 112800, target: 110000 },
  { month: 'Sep', revenue: 118900, target: 115000 },
  { month: 'Oct', revenue: 124500, target: 120000 },
  { month: 'Nov', revenue: 127450, target: 125000 }
];

export function RevenueAnalyticsDashboard() {
  const getTrendIcon = (trend: RevenueMetric['trend']) => {
    return trend === 'up' 
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const totalRevenue = revenueByPlan.reduce((sum, plan) => sum + plan.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {revenueMetrics.map((metric) => {
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
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Subscription Plan</CardTitle>
            <CardDescription>Last 30 days breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueByPlan.map((plan) => {
              const percentage = (plan.revenue / totalRevenue) * 100;
              return (
                <div key={plan.plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{plan.plan}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        ${plan.revenue.toLocaleString()}
                      </span>
                      <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className={`h-2 [&>div]:${plan.color}`} />
                  <div className="text-xs text-muted-foreground">
                    {plan.transactions.toLocaleString()} transactions
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Products</CardTitle>
            <CardDescription>Best performing products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.sales} sales • ${product.avgPrice.toFixed(2)} avg
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ${product.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Growth Trend</CardTitle>
              <CardDescription>Monthly revenue vs target (last 6 months)</CardDescription>
            </div>
            <Badge variant="outline" className="gap-2">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +29.4% vs 6 months ago
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenue.map((data) => {
              const achieved = (data.revenue / data.target) * 100;
              const isOverTarget = data.revenue >= data.target;
              
              return (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{data.month}</span>
                    <div className="flex-1 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          ${data.revenue.toLocaleString()} / ${data.target.toLocaleString()}
                        </span>
                        <Badge 
                          variant={isOverTarget ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {achieved.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress 
                        value={Math.min(achieved, 100)} 
                        className={`h-2 ${isOverTarget ? '[&>div]:bg-green-500' : '[&>div]:bg-yellow-500'}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$687,450</div>
              <div className="text-xs text-muted-foreground mt-1">Total (6 months)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$114,575</div>
              <div className="text-xs text-muted-foreground mt-1">Monthly Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">102.4%</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Target Achievement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

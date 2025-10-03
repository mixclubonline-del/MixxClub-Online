import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, TrendingUp, CheckCircle, AlertCircle, 
  Clock, Zap, Users, DollarSign
} from "lucide-react";

interface KPI {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: string;
  trend: string;
}

const kpis: KPI[] = [
  {
    name: 'Customer Acquisition Cost',
    current: 42.50,
    target: 50.00,
    unit: '$',
    status: 'excellent',
    category: 'Marketing',
    trend: '-15.2%'
  },
  {
    name: 'Lifetime Value',
    current: 1250,
    target: 1000,
    unit: '$',
    status: 'excellent',
    category: 'Revenue',
    trend: '+25.3%'
  },
  {
    name: 'Customer Satisfaction Score',
    current: 4.7,
    target: 4.5,
    unit: '/5',
    status: 'excellent',
    category: 'Customer Success',
    trend: '+4.4%'
  },
  {
    name: 'Average Response Time',
    current: 2.3,
    target: 4.0,
    unit: 'hrs',
    status: 'excellent',
    category: 'Support',
    trend: '-42.5%'
  },
  {
    name: 'Monthly Active Users',
    current: 8234,
    target: 8000,
    unit: '',
    status: 'good',
    category: 'Engagement',
    trend: '+2.9%'
  },
  {
    name: 'Feature Adoption Rate',
    current: 68,
    target: 75,
    unit: '%',
    status: 'warning',
    category: 'Product',
    trend: '+5.1%'
  },
  {
    name: 'Net Promoter Score',
    current: 62,
    target: 70,
    unit: '',
    status: 'warning',
    category: 'Customer Success',
    trend: '+8.7%'
  },
  {
    name: 'Conversion Rate',
    current: 3.2,
    target: 5.0,
    unit: '%',
    status: 'warning',
    category: 'Marketing',
    trend: '+1.2%'
  },
  {
    name: 'API Uptime',
    current: 99.97,
    target: 99.90,
    unit: '%',
    status: 'excellent',
    category: 'Technical',
    trend: '+0.02%'
  },
  {
    name: 'Average Load Time',
    current: 1.2,
    target: 2.0,
    unit: 's',
    status: 'excellent',
    category: 'Technical',
    trend: '-16.7%'
  },
  {
    name: 'Churn Rate',
    current: 2.4,
    target: 3.0,
    unit: '%',
    status: 'good',
    category: 'Revenue',
    trend: '-20.0%'
  },
  {
    name: 'Support Ticket Resolution',
    current: 87,
    target: 95,
    unit: '%',
    status: 'warning',
    category: 'Support',
    trend: '+3.6%'
  }
];

export function PerformanceKPIDashboard() {
  const getStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'excellent':
        return { badge: 'default', progress: 'bg-green-500', icon: CheckCircle, iconColor: 'text-green-500' };
      case 'good':
        return { badge: 'secondary', progress: 'bg-blue-500', icon: CheckCircle, iconColor: 'text-blue-500' };
      case 'warning':
        return { badge: 'secondary', progress: 'bg-yellow-500', icon: AlertCircle, iconColor: 'text-yellow-500' };
      case 'critical':
        return { badge: 'destructive', progress: 'bg-red-500', icon: AlertCircle, iconColor: 'text-red-500' };
    }
  };

  const calculateProgress = (current: number, target: number, lower: boolean = false) => {
    if (lower) {
      // For metrics where lower is better (e.g., response time, churn)
      return Math.min((target / current) * 100, 100);
    }
    return Math.min((current / target) * 100, 100);
  };

  const categories = Array.from(new Set(kpis.map(kpi => kpi.category)));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Marketing':
        return TrendingUp;
      case 'Revenue':
        return DollarSign;
      case 'Customer Success':
        return Users;
      case 'Support':
        return Clock;
      case 'Product':
        return Target;
      case 'Technical':
        return Zap;
      case 'Engagement':
        return Users;
      default:
        return Target;
    }
  };

  const getStatusSummary = () => {
    const excellent = kpis.filter(k => k.status === 'excellent').length;
    const good = kpis.filter(k => k.status === 'good').length;
    const warning = kpis.filter(k => k.status === 'warning').length;
    const critical = kpis.filter(k => k.status === 'critical').length;
    
    return { excellent, good, warning, critical };
  };

  const summary = getStatusSummary();

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.excellent}</div>
                <div className="text-sm text-muted-foreground">Excellent</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{summary.good}</div>
                <div className="text-sm text-muted-foreground">Good</div>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
                <div className="text-sm text-muted-foreground">Needs Attention</div>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs by Category */}
      {categories.map((category) => {
        const CategoryIcon = getCategoryIcon(category);
        const categoryKPIs = kpis.filter(kpi => kpi.category === category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5" />
                {category} KPIs
              </CardTitle>
              <CardDescription>
                {categoryKPIs.length} key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryKPIs.map((kpi) => {
                  const statusConfig = getStatusColor(kpi.status);
                  const Icon = statusConfig.icon;
                  const isLowerBetter = kpi.name.includes('Cost') || 
                                       kpi.name.includes('Time') || 
                                       kpi.name.includes('Churn');
                  const progress = calculateProgress(kpi.current, kpi.target, isLowerBetter);
                  
                  return (
                    <div
                      key={kpi.name}
                      className="p-4 border rounded-lg bg-card space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`h-4 w-4 ${statusConfig.iconColor}`} />
                            <span className="font-medium text-sm">{kpi.name}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">
                              {kpi.unit === '$' && kpi.unit}
                              {kpi.current.toLocaleString()}
                              {kpi.unit !== '$' && kpi.unit}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {kpi.unit === '$' && kpi.unit}{kpi.target.toLocaleString()}{kpi.unit !== '$' && kpi.unit}
                            </span>
                          </div>
                        </div>
                        <Badge variant={statusConfig.badge as "default" | "destructive" | "outline" | "secondary"} className="text-xs capitalize">
                          {kpi.status}
                        </Badge>
                      </div>

                      <Progress 
                        value={progress} 
                        className={`h-2 [&>div]:${statusConfig.progress}`}
                      />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {progress.toFixed(1)}% of target
                        </span>
                        <span className={kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {kpi.trend} vs last period
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

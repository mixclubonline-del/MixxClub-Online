import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Target } from "lucide-react";

const revenueData = [
  { month: 'Jan', revenue: 45000, costs: 28000, profit: 17000 },
  { month: 'Feb', revenue: 52000, costs: 30000, profit: 22000 },
  { month: 'Mar', revenue: 48000, costs: 29000, profit: 19000 },
  { month: 'Apr', revenue: 61000, costs: 32000, profit: 29000 },
  { month: 'May', revenue: 55000, costs: 31000, profit: 24000 },
  { month: 'Jun', revenue: 67000, costs: 33000, profit: 34000 },
];

const userGrowthData = [
  { month: 'Jan', users: 850, active: 680 },
  { month: 'Feb', users: 920, active: 750 },
  { month: 'Mar', users: 1050, active: 840 },
  { month: 'Apr', users: 1180, active: 920 },
  { month: 'May', users: 1250, active: 1000 },
  { month: 'Jun', users: 1420, active: 1150 },
];

const revenueBySource = [
  { name: 'Subscriptions', value: 145000 },
  { name: 'One-time Projects', value: 89000 },
  { name: 'Marketplace', value: 34000 },
  { name: 'Premium Features', value: 28000 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const kpiData = [
  {
    name: 'Monthly Revenue',
    value: '$67,000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-500'
  },
  {
    name: 'Total Users',
    value: '1,420',
    change: '+13.7%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500'
  },
  {
    name: 'Active Rate',
    value: '81%',
    change: '+2.3%',
    trend: 'up',
    icon: Activity,
    color: 'text-purple-500'
  },
  {
    name: 'Conversion Rate',
    value: '3.8%',
    change: '-0.5%',
    trend: 'down',
    icon: Target,
    color: 'text-orange-500'
  },
];

export function BusinessIntelligenceDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{kpi.name}</CardDescription>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`flex items-center gap-1 mt-1 text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{kpi.change}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue, Costs & Profit Trends</CardTitle>
              <CardDescription>6-month financial performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Costs"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stackId="3"
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue (6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">$328,000</div>
                <div className="text-sm text-muted-foreground mt-1">Average: $54,667/month</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Costs (6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">$183,000</div>
                <div className="text-sm text-muted-foreground mt-1">Average: $30,500/month</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Profit (6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">$145,000</div>
                <div className="text-sm text-muted-foreground mt-1">Margin: 44.2%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth & Engagement</CardTitle>
              <CardDescription>Total users vs active users over 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Total Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
              <CardDescription>Distribution of revenue streams</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBySource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Details</CardTitle>
              <CardDescription>Breakdown by revenue source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {revenueBySource.map((source, index) => (
                <div key={source.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{source.name}</span>
                    </div>
                    <span className="font-bold">${(source.value / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((source.value / revenueBySource.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}% of total revenue
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

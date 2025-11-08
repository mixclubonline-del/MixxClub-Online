import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Users, Activity, TrendingUp, DollarSign, 
  Clock, FileAudio, Zap, AlertCircle, Loader2, Radio 
} from "lucide-react";
import {
  useEnterpriseQuickStats,
  useEnterpriseUsageMetrics,
  useEnterpriseTeamActivity,
  useEnterpriseRevenueData,
  useEnterpriseDepartmentUsage,
  useEnterpriseAnalyticsRealtime,
} from "@/hooks/useEnterpriseAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnalyticsExportButton } from "./AnalyticsExportButton";
import { DashboardCustomizationDialog } from "./DashboardCustomizationDialog";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

export function EnterpriseAnalyticsDashboard() {
  // Enable real-time updates
  useEnterpriseAnalyticsRealtime();
  
  // Dashboard customization
  const { isWidgetVisible, getWidgetOrder } = useDashboardLayout();
  
  const { data: quickStats, isLoading: statsLoading, error: statsError } = useEnterpriseQuickStats();
  const { data: usageMetrics, isLoading: usageLoading } = useEnterpriseUsageMetrics();
  const { data: teamActivity, isLoading: activityLoading } = useEnterpriseTeamActivity();
  const { data: revenueData, isLoading: revenueLoading } = useEnterpriseRevenueData();
  const { data: departmentUsage, isLoading: deptLoading } = useEnterpriseDepartmentUsage();

  const isLoading = statsLoading || usageLoading || activityLoading || revenueLoading || deptLoading;

  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  // Calculate derived metrics
  const avgDailyLogins = teamActivity 
    ? Math.round(teamActivity.slice(0, 5).reduce((sum, d) => sum + d.logins, 0) / 5)
    : 0;
  
  const totalCollaborations = teamActivity 
    ? teamActivity.reduce((sum, d) => sum + d.collaborations, 0)
    : 0;
  
  const totalUploads = teamActivity 
    ? teamActivity.reduce((sum, d) => sum + d.uploads, 0)
    : 0;

  const totalRevenue = revenueData 
    ? revenueData.reduce((sum, d) => sum + d.revenue, 0)
    : 0;

  const arr = quickStats ? quickStats.monthlyRevenue * 12 : 0;
  
  const avgContractValue = revenueData && revenueData.length > 0
    ? totalRevenue / revenueData.reduce((sum, d) => sum + d.contracts + d.renewals, 0)
    : 0;

  const renewalRate = revenueData && revenueData.length > 0
    ? (revenueData.reduce((sum, d) => sum + d.renewals, 0) / 
       revenueData.reduce((sum, d) => sum + d.contracts + d.renewals, 0)) * 100
    : 0;

  const storagePercent = quickStats 
    ? Math.round((quickStats.storageUsed / quickStats.storageCapacity) * 100)
    : 0;

  // Create ordered widgets array
  const widgets = [
    { id: 'quick-stats', component: renderQuickStats() },
    { id: 'usage-growth', component: renderUsageGrowth() },
    { id: 'department-distribution', component: renderDepartmentDistribution() },
    { id: 'storage-trend', component: renderStorageTrend() },
    { id: 'team-activity', component: renderTeamActivity() },
    { id: 'activity-stats', component: renderActivityStats() },
    { id: 'revenue-growth', component: renderRevenueGrowth() },
    { id: 'contract-activity', component: renderContractActivity() },
    { id: 'revenue-metrics', component: renderRevenueMetrics() },
  ]
    .filter(widget => isWidgetVisible(widget.id))
    .sort((a, b) => getWidgetOrder(a.id) - getWidgetOrder(b.id));

  function renderQuickStats() {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +{quickStats?.userGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +{quickStats?.projectGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${quickStats?.monthlyRevenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +{quickStats?.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quickStats?.storageUsed.toFixed(1) || 0} TB
            </div>
            <p className="text-xs text-muted-foreground">
              {storagePercent}% of {quickStats?.storageCapacity || 0} TB capacity
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderUsageGrowth() {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects & Users Growth</CardTitle>
              <CardDescription>Monthly trend over last 6 months</CardDescription>
            </div>
            <AnalyticsExportButton data={usageMetrics} filename="usage-metrics" title="Export" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usageMetrics || []}>
              <defs>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="projects" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorProjects)" 
                name="Projects"
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="hsl(var(--secondary))" 
                fillOpacity={1} 
                fill="url(#colorUsers)"
                name="Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  function renderDepartmentDistribution() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
          <CardDescription>Usage breakdown by department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentUsage || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {(departmentUsage || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  function renderStorageTrend() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage Trend</CardTitle>
          <CardDescription>Terabytes of storage used per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageMetrics || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="storage" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Storage (TB)"
                dot={{ fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  function renderTeamActivity() {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Team Activity</CardTitle>
              <CardDescription>User engagement metrics for the current week</CardDescription>
            </div>
            <AnalyticsExportButton data={teamActivity} filename="team-activity" title="Export" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={teamActivity || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="logins" fill="hsl(var(--primary))" name="Logins" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collaborations" fill="hsl(var(--secondary))" name="Collaborations" radius={[4, 4, 0, 0]} />
              <Bar dataKey="uploads" fill="hsl(var(--accent))" name="File Uploads" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  function renderActivityStats() {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Logins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyLogins}</div>
            <p className="text-xs text-muted-foreground">Per business day this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaboration Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCollaborations}</div>
            <p className="text-xs text-muted-foreground">Total sessions this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUploads}</div>
            <p className="text-xs text-muted-foreground">Audio files this week</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderRevenueGrowth() {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Monthly recurring revenue and contract performance</CardDescription>
            </div>
            <AnalyticsExportButton data={revenueData} filename="revenue-data" title="Export" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  function renderContractActivity() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contract Activity</CardTitle>
          <CardDescription>New contracts vs renewals per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="contracts" fill="hsl(var(--primary))" name="New Contracts" radius={[4, 4, 0, 0]} />
              <Bar dataKey="renewals" fill="hsl(var(--secondary))" name="Renewals" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  function renderRevenueMetrics() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Revenue Metrics</CardTitle>
          <CardDescription>Current period performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ARR</span>
            <span className="text-lg font-bold">${arr.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Contract Value</span>
            <span className="text-lg font-bold">
              ${avgContractValue > 0 ? avgContractValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Renewal Rate</span>
            <Badge variant="outline" className="text-green-500 border-green-500">
              {renewalRate > 0 ? renewalRate.toFixed(0) : 0}%
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Growth Rate (MoM)</span>
            <Badge variant="outline" className="text-primary border-primary">
              +{quickStats?.revenueGrowth || 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-2">
          <Radio className="h-3 w-3 text-green-500 animate-pulse" />
          Live Updates Enabled
        </Badge>
        <DashboardCustomizationDialog />
      </div>

      {/* Render visible widgets in custom order */}
      {widgets.map((widget, index) => (
        <div key={widget.id}>
          {widget.component}
        </div>
      ))}

      {widgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No widgets visible</p>
            <DashboardCustomizationDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

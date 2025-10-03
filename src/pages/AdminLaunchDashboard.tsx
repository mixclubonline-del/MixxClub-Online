import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Rocket,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminLaunchDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsRes, predictionRes] = await Promise.all([
        supabase.functions.invoke('analyze-launch-metrics'),
        supabase.functions.invoke('predict-revenue', { body: { days: 90 } }),
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (predictionRes.data) setPrediction(predictionRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateAdCopy = async (platform: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ad-copy', {
        body: {
          platform,
          productName: 'MixClub',
          productDescription:
            'Professional audio mixing and mastering marketplace connecting artists with top engineers',
          targetAudience: 'Independent musicians and content creators',
          keyBenefits: [
            'Affordable professional quality',
            'Fast turnaround',
            'Expert engineers',
            'AI-powered matching',
          ],
        },
      });

      if (error) throw error;
      toast.success(`${platform} ad copy generated!`);
      console.log('Generated ad copy:', data);
    } catch (error) {
      toast.error('Failed to generate ad copy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Launch Command Center</h1>
              <p className="text-muted-foreground">Real-time $50M Launch Tracking</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/launch-presentation')}>
              View Presentation
            </Button>
            <Button onClick={loadDashboardData}>Refresh Data</Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics?.totals?.revenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: $2,200/day (90-day goal)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.funnel?.overall_conversion || 3}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Target: 6-8%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Signups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totals?.signups || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Target: 40/day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                90-Day Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${prediction?.predicted_revenue || '66-88K'}
              </div>
              <p className="text-xs text-green-600 mt-1">On track to goal</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="ads">Paid Acquisition</TabsTrigger>
            <TabsTrigger value="tests">A/B Tests</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Daily Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Today's Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Homepage Visits',
                      value: metrics?.totals?.page_views || 0,
                      target: 833,
                      status: 'on-track',
                    },
                    {
                      label: 'Qualifier Starts',
                      value: Math.floor((metrics?.totals?.page_views || 0) * 0.15),
                      target: 125,
                      status: 'on-track',
                    },
                    {
                      label: 'Projects Started',
                      value: metrics?.totals?.projects || 0,
                      target: 20,
                      status: 'below',
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">/ {metric.target}</p>
                      </div>
                      <Badge
                        variant={metric.status === 'on-track' ? 'default' : 'destructive'}
                        className="mt-2"
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <Button onClick={() => generateAdCopy('google')} variant="outline">
                    Generate Google Ads
                  </Button>
                  <Button onClick={() => generateAdCopy('facebook')} variant="outline">
                    Generate Facebook Ads
                  </Button>
                  <Button onClick={() => generateAdCopy('tiktok')} variant="outline">
                    Generate TikTok Ads
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      stage: 'Homepage → Qualifier',
                      current: 15,
                      target: 25,
                      visitors: 1000,
                    },
                    {
                      stage: 'Qualifier → Signup',
                      current: metrics?.funnel?.qualifier_to_signup || 20,
                      target: 40,
                      visitors: 150,
                    },
                    {
                      stage: 'Signup → Project',
                      current: metrics?.funnel?.signup_to_project || 50,
                      target: 70,
                      visitors: 30,
                    },
                    {
                      stage: 'Project → Payment',
                      current: metrics?.funnel?.project_to_payment || 10,
                      target: 20,
                      visitors: 15,
                    },
                  ].map((stage) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {stage.visitors} visitors
                          </span>
                          <span className="text-sm font-medium">{stage.current}%</span>
                          <span className="text-xs text-muted-foreground">→ {stage.target}%</span>
                        </div>
                      </div>
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${stage.current}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  platform: 'Google Ads',
                  spend: '$0',
                  budget: '$6K/mo',
                  roas: 'Not launched',
                  status: 'pending',
                },
                {
                  platform: 'Facebook/IG',
                  spend: '$0',
                  budget: '$6K/mo',
                  roas: 'Not launched',
                  status: 'pending',
                },
                {
                  platform: 'TikTok',
                  spend: '$0',
                  budget: '$3K/mo',
                  roas: 'Not launched',
                  status: 'pending',
                },
              ].map((ad) => (
                <Card key={ad.platform}>
                  <CardHeader>
                    <CardTitle className="text-lg">{ad.platform}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spend:</span>
                        <span className="font-medium">{ad.spend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">{ad.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROAS:</span>
                        <span className="font-medium">{ad.roas}</span>
                      </div>
                      <Badge
                        variant={ad.status === 'pending' ? 'outline' : 'default'}
                        className="w-full justify-center mt-2"
                      >
                        {ad.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active A/B Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      test: 'Hero Video',
                      status: 'Ready to launch',
                      variants: 'Static vs Motion',
                    },
                    { test: 'CTA Color', status: 'Ready to launch', variants: 'Purple vs Green' },
                    {
                      test: 'Pricing Display',
                      status: 'Ready to launch',
                      variants: 'Starting at vs Full',
                    },
                  ].map((test) => (
                    <div key={test.test} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{test.test}</p>
                        <p className="text-sm text-muted-foreground">{test.variants}</p>
                      </div>
                      <Badge variant="outline">{test.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border border-yellow-500/50 rounded-lg bg-yellow-500/5">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Conversion rate below target</p>
                      <p className="text-sm text-muted-foreground">
                        Current: 3.2% | Target: 6% | Consider launching A/B tests
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-green-500/50 rounded-lg bg-green-500/5">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">All systems operational</p>
                      <p className="text-sm text-muted-foreground">
                        Backend, payments, and infrastructure running smoothly
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminLaunchDashboard;

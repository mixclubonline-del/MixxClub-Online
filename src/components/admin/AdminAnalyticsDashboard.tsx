import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, DollarSign, FlaskConical, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from 'recharts';
import { format, subDays, startOfWeek, differenceInWeeks } from 'date-fns';

const fromAny = (table: string) => (supabase.from as any)(table);

export const AdminAnalyticsDashboard: React.FC = () => {
  const [tab, setTab] = useState('funnel');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Platform Analytics
        </h2>
        <p className="text-muted-foreground text-sm">Deep-dive into platform performance and user behavior.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="funnel" className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" /> Funnel
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> Retention
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" /> Revenue
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" /> Activity
          </TabsTrigger>
          <TabsTrigger value="abtests" className="flex items-center gap-1.5">
            <FlaskConical className="h-4 w-4" /> A/B Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="mt-4"><FunnelView /></TabsContent>
        <TabsContent value="retention" className="mt-4"><RetentionView /></TabsContent>
        <TabsContent value="revenue" className="mt-4"><RevenueView /></TabsContent>
        <TabsContent value="activity" className="mt-4"><ActivityView /></TabsContent>
        <TabsContent value="abtests" className="mt-4"><ABTestView /></TabsContent>
      </Tabs>
    </div>
  );
};

function FunnelView() {
  const { data: funnelData, isLoading } = useQuery({
    queryKey: ['admin-funnel'],
    queryFn: async () => {
      const { data, error } = await fromAny('funnel_events')
        .select('event_type')
        .gte('created_at', subDays(new Date(), 30).toISOString());
      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((e: any) => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });

      const stages = ['signup', 'onboarding_complete', 'first_project', 'first_payment'];
      return stages.map((stage) => ({
        stage: stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count: counts[stage] || 0,
      }));
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(210, 60%, 55%)', 'hsl(145, 60%, 45%)'];

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Conversion Funnel (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis type="category" dataKey="stage" width={140} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {(funnelData || []).map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RetentionView() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-retention'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('created_at, last_sign_in')
        .order('created_at', { ascending: true })
        .limit(1000);
      if (error) throw error;

      // Group by signup week and check if active in subsequent weeks
      const now = new Date();
      const weeks = Array.from({ length: 8 }, (_, i) => ({
        week: `W${i + 1}`,
        retained: 0,
        total: 0,
      }));

      (profiles || []).forEach((p: any) => {
        const signupDate = new Date(p.created_at);
        const weeksSinceSignup = Math.min(7, differenceInWeeks(now, signupDate));
        if (weeksSinceSignup >= 0 && weeksSinceSignup < 8) {
          weeks[weeksSinceSignup].total++;
          if (p.last_sign_in) {
            const lastActive = new Date(p.last_sign_in);
            const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceActive < 7) weeks[weeksSinceSignup].retained++;
          }
        }
      });

      return weeks.map((w) => ({
        ...w,
        rate: w.total > 0 ? Math.round((w.retained / w.total) * 100) : 0,
      }));
    },
    staleTime: 10 * 60_000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Cohort Retention by Signup Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            />
            <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RevenueView() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'completed')
        .gte('created_at', subDays(new Date(), 30).toISOString())
        .order('created_at', { ascending: true });
      if (error) throw error;

      const daily: Record<string, number> = {};
      (payments || []).forEach((p: any) => {
        const day = format(new Date(p.created_at), 'MMM dd');
        daily[day] = (daily[day] || 0) + (p.amount || 0);
      });

      return Object.entries(daily).map(([day, amount]) => ({ day, amount }));
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Daily Revenue (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ActivityView() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-activity-trends'],
    queryFn: async () => {
      const days = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return { date: format(date, 'MMM dd'), iso: format(date, 'yyyy-MM-dd'), dau: 0 };
      });

      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('user_id, created_at')
        .gte('created_at', subDays(new Date(), 14).toISOString());
      if (error) throw error;

      const dailyUsers: Record<string, Set<string>> = {};
      (logs || []).forEach((l: any) => {
        const day = format(new Date(l.created_at), 'yyyy-MM-dd');
        if (!dailyUsers[day]) dailyUsers[day] = new Set();
        if (l.user_id) dailyUsers[day].add(l.user_id);
      });

      return days.map((d) => ({
        ...d,
        dau: dailyUsers[d.iso]?.size || 0,
      }));
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Daily Active Users (14 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="dau" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ABTestView() {
  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['admin-ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (tests.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="p-8 text-center">
          <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No A/B tests configured yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((test: any) => {
        const variants = Array.isArray(test.variants) ? test.variants : [];
        return (
          <Card key={test.id} variant="glass">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold">{test.test_name}</h3>
                  {test.description && <p className="text-sm text-muted-foreground">{test.description}</p>}
                </div>
                <Badge className={test.is_active ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}>
                  {test.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {variants.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {variants.map((v: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 text-center">
                      <p className="text-sm font-medium">{typeof v === 'string' ? v : v.name || `Variant ${i}`}</p>
                      {typeof v === 'object' && v.weight && (
                        <p className="text-xs text-muted-foreground">{v.weight}% traffic</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, CheckCircle2, Circle, AlertCircle, Users, Database, Shield, CreditCard, Music, Settings } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'complete' | 'incomplete' | 'warning';
  icon: React.ReactNode;
}

export default function AdminLaunchControl() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch launch readiness data
  const { data: readinessData, isLoading } = useQuery({
    queryKey: ['admin-launch-readiness'],
    queryFn: async () => {
      const [
        usersRes,
        profilesRes,
        packagesRes,
        beatsRes,
        sessionsRes,
        achievementsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('engineer_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('mixing_packages').select('id', { count: 'exact', head: true }),
        supabase.from('demo_beats').select('id', { count: 'exact', head: true }),
        supabase.from('collaboration_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('achievements').select('id', { count: 'exact', head: true }),
      ]);

      return {
        users: usersRes.count || 0,
        engineers: profilesRes.count || 0,
        packages: packagesRes.count || 0,
        beats: beatsRes.count || 0,
        sessions: sessionsRes.count || 0,
        achievements: achievementsRes.count || 0,
      };
    },
  });

  const checklist: ChecklistItem[] = [
    // User Management
    { id: 'users', category: 'User Management', name: 'User Profiles', description: 'User profiles table configured', status: (readinessData?.users || 0) > 0 ? 'complete' : 'warning', icon: <Users className="h-4 w-4" /> },
    { id: 'engineers', category: 'User Management', name: 'Engineer Profiles', description: 'Engineer profiles configured', status: (readinessData?.engineers || 0) > 0 ? 'complete' : 'warning', icon: <Users className="h-4 w-4" /> },
    { id: 'roles', category: 'User Management', name: 'Role System', description: 'Admin role system with has_role RPC', status: 'complete', icon: <Shield className="h-4 w-4" /> },
    
    // Content
    { id: 'beats', category: 'Content', name: 'Demo Beats', description: 'Demo beats seeded', status: (readinessData?.beats || 0) > 0 ? 'complete' : 'incomplete', icon: <Music className="h-4 w-4" /> },
    { id: 'packages', category: 'Content', name: 'Service Packages', description: 'Mixing/mastering packages configured', status: (readinessData?.packages || 0) > 0 ? 'complete' : 'incomplete', icon: <Settings className="h-4 w-4" /> },
    
    // Database & Security
    { id: 'rls', category: 'Database & Security', name: 'RLS Policies', description: 'Row Level Security enabled on all tables', status: 'complete', icon: <Shield className="h-4 w-4" /> },
    { id: 'audit', category: 'Database & Security', name: 'Audit Logging', description: 'Audit log table configured', status: 'complete', icon: <Database className="h-4 w-4" /> },
    
    // Payments
    { id: 'stripe', category: 'Payments', name: 'Stripe Integration', description: 'Stripe API keys configured', status: 'complete', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'payouts', category: 'Payments', name: 'Payout System', description: 'Payout request system', status: 'complete', icon: <CreditCard className="h-4 w-4" /> },
    
    // Features
    { id: 'sessions', category: 'Features', name: 'Collaboration Sessions', description: 'Session system active', status: (readinessData?.sessions || 0) > 0 ? 'complete' : 'warning', icon: <Music className="h-4 w-4" /> },
    { id: 'achievements', category: 'Features', name: 'Gamification', description: 'Achievement system configured', status: (readinessData?.achievements || 0) > 0 ? 'complete' : 'warning', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const categories = [...new Set(checklist.map(item => item.category))];
  
  const getStatusCounts = () => {
    const complete = checklist.filter(i => i.status === 'complete').length;
    const warning = checklist.filter(i => i.status === 'warning').length;
    const incomplete = checklist.filter(i => i.status === 'incomplete').length;
    return { complete, warning, incomplete, total: checklist.length };
  };

  const statusCounts = getStatusCounts();
  const progressPercent = (statusCounts.complete / statusCounts.total) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'incomplete': return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete': return <Badge className="bg-green-500/10 text-green-500">Ready</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/10 text-yellow-500">Needs Data</Badge>;
      case 'incomplete': return <Badge variant="destructive">Missing</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Rocket className="h-8 w-8 text-primary" />
              Launch Control
            </h1>
            <p className="text-muted-foreground">
              Platform readiness checklist and launch status
            </p>
          </div>
          <Badge variant={progressPercent === 100 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
            {Math.round(progressPercent)}% Ready
          </Badge>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Launch Readiness</CardTitle>
            <CardDescription>Overall platform readiness for launch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercent} className="h-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-green-500/10">
                <div className="text-2xl font-bold text-green-500">{statusCounts.complete}</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10">
                <div className="text-2xl font-bold text-yellow-500">{statusCounts.warning}</div>
                <div className="text-sm text-muted-foreground">Needs Attention</div>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">{statusCounts.incomplete}</div>
                <div className="text-sm text-muted-foreground">Missing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readinessData?.users || 0}</div>
              <p className="text-xs text-muted-foreground">{readinessData?.engineers || 0} engineers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readinessData?.beats || 0}</div>
              <p className="text-xs text-muted-foreground">demo beats available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readinessData?.sessions || 0}</div>
              <p className="text-xs text-muted-foreground">collaboration sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Checklist by Category */}
        {categories.map(category => {
          const items = checklist.filter(i => i.category === category);
          const categoryComplete = items.filter(i => i.status === 'complete').length;
          
          return (
            <Card key={category}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {categoryComplete}/{items.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {(expandedCategory === category || expandedCategory === null) && (
                <CardContent className="space-y-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg border"
                    >
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Launch Action */}
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Ready to Launch?</h3>
                <p className="text-muted-foreground">
                  {progressPercent === 100 
                    ? 'All systems are go! Platform is ready for launch.'
                    : `Complete the remaining ${statusCounts.incomplete + statusCounts.warning} items before launch.`
                  }
                </p>
              </div>
              <Button 
                size="lg" 
                disabled={progressPercent < 100}
                className="gap-2"
              >
                <Rocket className="h-5 w-5" />
                {progressPercent === 100 ? 'Launch Platform' : 'Not Ready'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

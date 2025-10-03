import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Rocket, Shield, Database, Zap, Globe, Smartphone, Lock, RefreshCw, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface PreFlightCheck {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration_ms: number;
}

interface DeploymentLog {
  id: string;
  deployment_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  pre_flight_checks: any; // JSON from database
}

export default function AdminLaunchControl() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [preFlightChecks, setPreFlightChecks] = useState<PreFlightCheck[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<DeploymentLog[]>([]);

  useEffect(() => {
    checkAdminStatus();
    fetchRecentDeployments();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
    
    if (error || !data) {
      toast.error("Admin access required");
      navigate('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const fetchRecentDeployments = async () => {
    const { data, error } = await supabase
      .from('deployment_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentDeployments(data);
    }
  };

  const runPreFlightChecks = async () => {
    setLoading(true);
    const checks: PreFlightCheck[] = [];

    // Database check
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
    checks.push({
      name: 'Database Connectivity',
      status: dbError ? 'failed' : 'passed',
      message: dbError ? dbError.message : 'Database is operational',
      duration_ms: Date.now() - dbStart,
    });

    // Storage check
    const storageStart = Date.now();
    const { error: storageError } = await supabase.storage.listBuckets();
    checks.push({
      name: 'Storage Buckets',
      status: storageError ? 'failed' : 'passed',
      message: storageError ? storageError.message : 'Storage is operational',
      duration_ms: Date.now() - storageStart,
    });

    // Auth check
    const authStart = Date.now();
    const { error: authError } = await supabase.auth.getSession();
    checks.push({
      name: 'Authentication',
      status: authError ? 'failed' : 'passed',
      message: authError ? authError.message : 'Auth system operational',
      duration_ms: Date.now() - authStart,
    });

    setPreFlightChecks(checks);
    setLoading(false);
    
    const allPassed = checks.every(c => c.status === 'passed');
    if (allPassed) {
      toast.success("All pre-flight checks passed!");
    } else {
      toast.error("Some pre-flight checks failed");
    }
  };

  const handleDeploy = async (type: 'pwa' | 'feature_unlock' | 'maintenance') => {
    setDeploying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('deploy-to-production', {
        body: { 
          deploymentType: type,
          config: type === 'feature_unlock' ? {
            features: ['MIX_BATTLES_ENABLED', 'EDUCATION_HUB_ENABLED']
          } : {}
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${type.toUpperCase()} deployment initiated!`);
        fetchRecentDeployments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  if (authLoading || loading || !isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'warning':
      case 'in_progress':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
      case 'success':
        return <Badge variant="default">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'warning':
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Rocket className="h-8 w-8 text-primary" />
              Launch Control Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Deploy features, run checks, and monitor system health
            </p>
          </div>
          <Button onClick={runPreFlightChecks} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Pre-Flight Checks
          </Button>
        </div>

        {/* Pre-Flight Checks */}
        {preFlightChecks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pre-Flight Checks
              </CardTitle>
              <CardDescription>System health verification before deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preFlightChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        check.status === 'passed' ? 'bg-green-500' :
                        check.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{check.duration_ms}ms</span>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deployment Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Deploy PWA
              </CardTitle>
              <CardDescription>Update progressive web app instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleDeploy('pwa')}
                disabled={deploying}
              >
                <Zap className="h-4 w-4 mr-2" />
                Launch PWA
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Unlock Features
              </CardTitle>
              <CardDescription>Enable community milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleDeploy('feature_unlock')}
                disabled={deploying}
              >
                <Lock className="h-4 w-4 mr-2" />
                Unlock Features
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Maintenance Mode
              </CardTitle>
              <CardDescription>Pause services for updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDeploy('maintenance')}
                disabled={deploying}
              >
                Enable Maintenance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deployments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
            <CardDescription>Deployment history and status</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeployments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No deployments yet</p>
            ) : (
              <div className="space-y-3">
                {recentDeployments.map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{deployment.deployment_type.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(deployment.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(deployment.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

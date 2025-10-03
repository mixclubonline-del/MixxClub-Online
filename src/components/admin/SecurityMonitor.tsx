import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface SecurityStats {
  total_events_today: number;
  critical_unresolved: number;
  high_unresolved: number;
  injection_attempts_today: number;
  failed_security_checks_today: number;
  total_audit_logs: number;
  quick_actions_today: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  created_at: string;
  is_resolved: boolean;
}

export default function SecurityMonitor() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityData = async () => {
    try {
      // Get security stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_security_dashboard_stats');

      if (statsError) throw statsError;
      
      // Parse the jsonb response safely
      const data = statsData as any;
      const parsedStats: SecurityStats = {
        total_events_today: Number(data?.total_events_today) || 0,
        critical_unresolved: Number(data?.critical_unresolved) || 0,
        high_unresolved: Number(data?.high_unresolved) || 0,
        injection_attempts_today: Number(data?.injection_attempts_today) || 0,
        failed_security_checks_today: Number(data?.failed_security_checks_today) || 0,
        total_audit_logs: Number(data?.total_audit_logs) || 0,
        quick_actions_today: Number(data?.quick_actions_today) || 0
      };
      setStats(parsedStats);

      // Get recent security events
      const { data: eventsData, error: eventsError } = await supabase
        .from('admin_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) throw eventsError;
      setRecentEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'high': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'low': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Activity className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Security Monitor</h2>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Events Today</p>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats?.total_events_today || 0}</p>
            <Badge variant="secondary" className="text-xs">
              {stats?.total_audit_logs || 0} Total Logs
            </Badge>
          </div>
        </Card>

        <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 dark:text-red-400">Critical Issues</p>
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats?.critical_unresolved || 0}
            </p>
            <Badge variant="destructive" className="text-xs">
              {stats?.high_unresolved || 0} High Priority
            </Badge>
          </div>
        </Card>

        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-600 dark:text-amber-400">Injection Attempts</p>
              <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats?.injection_attempts_today || 0}
            </p>
            <Badge className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {stats?.failed_security_checks_today || 0} Failed Checks
            </Badge>
          </div>
        </Card>

        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-600 dark:text-green-400">Quick Actions</p>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.quick_actions_today || 0}
            </p>
            <Badge className="text-xs bg-green-500/10 text-green-600 dark:text-green-400">
              Today
            </Badge>
          </div>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Security Events
        </h3>
        
        {recentEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No security events recorded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div 
                key={event.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  {event.is_resolved ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] ${getSeverityColor(event.severity)}`}
                      >
                        {event.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.event_type}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={event.is_resolved ? 'default' : 'destructive'}
                  className="text-[10px] ml-2"
                >
                  {event.is_resolved ? 'Resolved' : 'Active'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

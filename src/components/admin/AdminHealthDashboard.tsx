import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import {
  Database, Users, FileAudio, Music, Shield, Activity,
  HardDrive, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableCount {
  label: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

export const AdminHealthDashboard = () => {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const [
        { count: profileCount },
        { count: projectCount },
        { count: audioCount },
        { count: beatCount },
        { count: paymentCount },
        { count: securityCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('audio_files').select('*', { count: 'exact', head: true }),
        supabase.from('producer_beats').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        supabase.from('admin_security_events').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
      ]);

      // Estimate storage from audio file sizes
      const { data: storageSample } = await supabase
        .from('audio_files')
        .select('file_size')
        .not('file_size', 'is', null)
        .limit(1000);

      const totalStorageBytes = storageSample?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0;

      return {
        profiles: profileCount || 0,
        projects: projectCount || 0,
        audioFiles: audioCount || 0,
        beats: beatCount || 0,
        payments: paymentCount || 0,
        unresolvedAlerts: securityCount || 0,
        estimatedStorageMB: Math.round(totalStorageBytes / (1024 * 1024)),
      };
    },
    refetchInterval: 60000,
  });

  const tableCounts: TableCount[] = health
    ? [
        { label: 'Profiles', icon: <Users className="w-4 h-4" />, count: health.profiles, color: 'text-blue-500' },
        { label: 'Projects', icon: <Activity className="w-4 h-4" />, count: health.projects, color: 'text-green-500' },
        { label: 'Audio Files', icon: <FileAudio className="w-4 h-4" />, count: health.audioFiles, color: 'text-purple-500' },
        { label: 'Beats', icon: <Music className="w-4 h-4" />, count: health.beats, color: 'text-yellow-500' },
        { label: 'Payments', icon: <Database className="w-4 h-4" />, count: health.payments, color: 'text-cyan-500' },
        { label: 'Open Alerts', icon: <Shield className="w-4 h-4" />, count: health.unresolvedAlerts, color: 'text-red-500' },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">System Health</h3>
          {health && (
            <span className="text-xs text-muted-foreground">
              ~{health.estimatedStorageMB} MB audio storage
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()}>
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-background/50 border-border/50 animate-pulse">
              <CardContent className="p-3 h-16" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tableCounts.map((tc) => (
            <Card key={tc.label} className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-3 flex items-center gap-2">
                <div className={tc.color}>{tc.icon}</div>
                <div>
                  <p className="text-lg font-bold text-foreground leading-tight">{tc.count.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{tc.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent system metrics */}
      {health?.recentMetrics && health.recentMetrics.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-3 h-3" />
          Last metric recorded: {new Date((health.recentMetrics[0] as any).recorded_at).toLocaleString()}
        </div>
      )}
    </div>
  );
};

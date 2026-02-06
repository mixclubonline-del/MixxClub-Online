import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, AlertTriangle } from 'lucide-react';
import { AdminSeedingPanel } from './AdminSeedingPanel';
import { PayoutProcessingControl } from './PayoutProcessingControl';
import { format } from 'date-fns';

export const AdminSystemHub = () => {
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const severityColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400',
    high: 'bg-orange-500/20 text-orange-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-blue-500/20 text-blue-400',
    info: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      {/* Admin Tools */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-4 h-4" /> Seeding Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminSeedingPanel />
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-4 h-4" /> Payout Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PayoutProcessingControl />
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-4 h-4" /> Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center py-6">
              <Shield className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No security events recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-start justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      event.severity === 'critical' || event.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">{event.event_type}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge variant="outline" className={severityColors[event.severity || 'info'] || ''}>
                      {event.severity || 'info'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

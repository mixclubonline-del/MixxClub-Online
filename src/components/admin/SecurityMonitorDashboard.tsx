import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Ban, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  admin_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: any;
  is_resolved: boolean;
  created_at: string;
  auto_action_taken: boolean | null;
}

interface SecurityStats {
  total_events_today: number;
  critical_unresolved: number;
  high_unresolved: number;
  injection_attempts_today: number;
  failed_security_checks_today: number;
}

export function SecurityMonitorDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    total_events_today: 0,
    critical_unresolved: 0,
    high_unresolved: 0,
    injection_attempts_today: 0,
    failed_security_checks_today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchSecurityData();
    
    // Set up real-time subscription for new security events
    const channel = supabase
      .channel('security-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_security_events'
        },
        (payload) => {
          console.log('New security event:', payload);
          fetchSecurityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      // Calculate stats from events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('admin_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;
      
      const allEvents = eventsData || [];
      const todayEvents = allEvents.filter(e => new Date(e.created_at) >= today);
      
      setStats({
        total_events_today: todayEvents.length,
        critical_unresolved: allEvents.filter(e => !e.is_resolved && e.severity === 'critical').length,
        high_unresolved: allEvents.filter(e => !e.is_resolved && e.severity === 'high').length,
        injection_attempts_today: todayEvents.filter(e => e.event_type === 'injection_attempt').length,
        failed_security_checks_today: todayEvents.filter(e => e.event_type === 'security_check_failed').length,
      });

      setEvents(allEvents);
    } catch (error: any) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleBlockIP = async () => {
    if (!ipToBlock.trim()) {
      toast.error('Please enter an IP address');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('block-ip-address', {
        body: { 
          ipAddress: ipToBlock,
          reason: blockReason || 'Manual block by admin'
        }
      });

      if (error) throw error;

      toast.success('IP address blocked successfully');
      setShowBlockDialog(false);
      setIpToBlock('');
      setBlockReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to block IP');
    }
  };

  const resolveEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_security_events')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event resolved');
      fetchSecurityData();
      setSelectedEvent(null);
    } catch (error: any) {
      toast.error('Failed to resolve event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Monitor</h2>
          <p className="text-muted-foreground">Real-time security event tracking and threat detection</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSecurityData} variant="outline">
            Refresh
          </Button>
          <Button onClick={() => setShowBlockDialog(true)} variant="destructive">
            <Ban className="h-4 w-4 mr-2" />
            Block IP
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total_events_today}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold">{stats.critical_unresolved}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">{stats.high_unresolved}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Injection Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold">{stats.injection_attempts_today}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.failed_security_checks_today}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security incidents and suspicious activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading security events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No security events detected</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className={event.is_resolved ? 'opacity-50' : ''}>
                      <TableCell>
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.event_type}</TableCell>
                      <TableCell className="max-w-md truncate">{event.description}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.ip_address || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(event.created_at), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell>
                        {event.is_resolved ? (
                          <Badge variant="outline">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Open
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEvent(event)}
                          >
                            View
                          </Button>
                          {!event.is_resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveEvent(event.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type</Label>
                  <p className="font-mono text-sm">{selectedEvent.event_type}</p>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge variant={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="font-mono text-sm">{selectedEvent.ip_address || 'Unknown'}</p>
                </div>
                <div>
                  <Label>Time</Label>
                  <p className="text-sm">{format(new Date(selectedEvent.created_at), 'PPpp')}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedEvent.description}</p>
              </div>
              {selectedEvent.details && Object.keys(selectedEvent.details).length > 0 && (
                <div>
                  <Label>Additional Details</Label>
                  <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}
              {selectedEvent.auto_action_taken && (
                <div>
                  <Label>Auto Action Taken</Label>
                  <p className="text-sm mt-1">{selectedEvent.auto_action_taken}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block IP Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block IP Address</DialogTitle>
            <DialogDescription>
              Block an IP address from accessing the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="192.168.1.1"
                value={ipToBlock}
                onChange={(e) => setIpToBlock(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="Suspicious activity detected"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockIP}>
              Block IP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

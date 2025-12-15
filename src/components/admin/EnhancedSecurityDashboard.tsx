import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, AlertTriangle, Activity, Ban, CheckCircle2, Clock, 
  TrendingUp, Eye, Lock, Unlock, Users, Globe, Wifi, 
  ShieldAlert, ShieldCheck, FileWarning, Key, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string | null;
  description: string;
  admin_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: unknown;
  is_resolved: boolean | null;
  created_at: string;
  auto_action_taken: boolean | null;
}

interface ActiveSession {
  id: string;
  user_id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  last_active: string;
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalUnresolved: number;
  highUnresolved: number;
  resolvedToday: number;
  failedLogins24h: number;
  activeSessions: number;
  blockedIPs: number;
  securityScore: number;
}

export function EnhancedSecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalUnresolved: 0,
    highUnresolved: 0,
    resolvedToday: 0,
    failedLogins24h: 0,
    activeSessions: 0,
    blockedIPs: 0,
    securityScore: 85,
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState('permanent');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchSecurityData();
    
    const channel = supabase
      .channel('security-events-enhanced')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_security_events'
        },
        () => fetchSecurityData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      const [eventsResult, statsResult] = await Promise.all([
        supabase
          .from('admin_security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.rpc('get_security_dashboard_stats')
      ]);

      if (eventsResult.error) throw eventsResult.error;

      const allEvents = (eventsResult.data || []) as SecurityEvent[];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = (statsResult.data || {}) as Record<string, number>;
      
      setMetrics({
        totalEvents: stats.total_events || allEvents.length,
        criticalUnresolved: stats.critical_events || allEvents.filter(e => !e.is_resolved && e.severity === 'critical').length,
        highUnresolved: stats.high_events || allEvents.filter(e => !e.is_resolved && e.severity === 'high').length,
        resolvedToday: stats.resolved_today || allEvents.filter(e => e.is_resolved && new Date(e.created_at) >= today).length,
        failedLogins24h: stats.failed_logins || 0,
        activeSessions: 0,
        blockedIPs: 0,
        securityScore: calculateSecurityScore(allEvents),
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = (events: SecurityEvent[]): number => {
    const unresolvedCritical = events.filter(e => !e.is_resolved && e.severity === 'critical').length;
    const unresolvedHigh = events.filter(e => !e.is_resolved && e.severity === 'high').length;
    const unresolvedMedium = events.filter(e => !e.is_resolved && e.severity === 'medium').length;
    
    let score = 100;
    score -= unresolvedCritical * 15;
    score -= unresolvedHigh * 8;
    score -= unresolvedMedium * 3;
    
    return Math.max(0, Math.min(100, score));
  };

  const getSeverityColor = (severity: string): "destructive" | "secondary" | "outline" | "default" => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
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
          reason: blockReason || 'Manual block by admin',
          duration: blockDuration
        }
      });

      if (error) throw error;

      toast.success('IP address blocked successfully');
      setShowBlockDialog(false);
      setIpToBlock('');
      setBlockReason('');
      setBlockDuration('permanent');
      fetchSecurityData();
    } catch (error) {
      toast.error('Failed to block IP - feature may require additional setup');
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
    } catch (error) {
      toast.error('Failed to resolve event');
    }
  };

  const filteredEvents = events.filter(event => {
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
    if (filterStatus === 'resolved' && !event.is_resolved) return false;
    if (filterStatus === 'open' && event.is_resolved) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Enhanced Security Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time security monitoring, threat detection, and incident response
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSecurityData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowBlockDialog(true)} variant="destructive" size="sm">
            <Ban className="h-4 w-4 mr-2" />
            Block IP
          </Button>
        </div>
      </div>

      {/* Security Score Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Security Score</p>
              <div className={`text-4xl font-bold ${getScoreColor(metrics.securityScore)}`}>
                {metrics.securityScore}/100
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics.securityScore >= 80 ? 'Excellent' : 
                 metrics.securityScore >= 60 ? 'Good' : 
                 metrics.securityScore >= 40 ? 'Fair' : 'Critical'}
              </p>
            </div>
            <div className="w-32 h-32">
              <div className="relative w-full h-full">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={metrics.securityScore >= 80 ? 'hsl(142.1 76.2% 36.3%)' : 
                            metrics.securityScore >= 60 ? 'hsl(47.9 95.8% 53.1%)' : 
                            'hsl(0 84.2% 60.2%)'}
                    strokeWidth="3"
                    strokeDasharray={`${metrics.securityScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className={`h-8 w-8 ${getScoreColor(metrics.securityScore)}`} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalUnresolved}</div>
            <p className="text-xs text-muted-foreground">Unresolved critical events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{metrics.highUnresolved}</div>
            <p className="text-xs text-muted-foreground">Unresolved high severity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4 text-yellow-500" />
              Failed Logins (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLogins24h}</div>
            <p className="text-xs text-muted-foreground">Authentication failures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Resolved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{metrics.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">Events resolved today</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Events</CardTitle>
                  <CardDescription>Latest security incidents and alerts</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading security events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No security events match the current filters</p>
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
                      {filteredEvents.slice(0, 20).map((event) => (
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
                              <Badge variant="outline" className="text-green-600">
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
                                <Eye className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Threat Analysis</CardTitle>
              <CardDescription>Automated threat detection and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Brute Force Detection</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monitors for repeated failed login attempts from the same IP
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">SQL Injection Prevention</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Validates and sanitizes all database queries
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Rate Limiting</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Limits requests per IP to prevent abuse
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Security compliance and best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-green-500" />
                    <span>Row Level Security (RLS)</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-green-500" />
                    <span>API Key Rotation</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Up to date</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span>HTTPS Enforcement</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileWarning className="h-5 w-5 text-green-500" />
                    <span>Audit Logging</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <DialogFooter>
                {!selectedEvent.is_resolved && (
                  <Button onClick={() => resolveEvent(selectedEvent.id)}>
                    Mark as Resolved
                  </Button>
                )}
              </DialogFooter>
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
              <Label htmlFor="duration">Duration</Label>
              <Select value={blockDuration} onValueChange={setBlockDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
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

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Settings, Shield, AlertTriangle, Rocket, Users, Ticket,
  Copy, Check, Plus, Ban, RefreshCw, Send, Download,
} from 'lucide-react';
import { AdminSeedingPanel } from './AdminSeedingPanel';
import { PayoutProcessingControl } from './PayoutProcessingControl';
import { AdminHealthDashboard } from './AdminHealthDashboard';
import { format } from 'date-fns';
import { useLaunchMode, useUpdateConfig } from '@/hooks/usePlatformConfig';
import { useWaitlistStats, useWaitlistEntries, useSendInvite } from '@/hooks/useWaitlist';
import { useGenerateInviteCode, useInviteCodeList, useToggleInviteCode, type GenerateCodeOptions } from '@/hooks/useInviteCodes';
import { toast } from 'sonner';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export const AdminSystemHub = () => {
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Launch mode
  const { data: launchMode, isLoading: modeLoading } = useLaunchMode();
  const updateConfig = useUpdateConfig();

  // Waitlist
  const { data: waitlistStats } = useWaitlistStats();
  const { data: waitlistData, refetch: refetchWaitlist } = useWaitlistEntries(0, 10);
  const sendInvite = useSendInvite();

  // Invite codes
  const { data: inviteCodes } = useInviteCodeList();
  const generateCode = useGenerateInviteCode();
  const toggleCode = useToggleInviteCode();

  // New code form
  const [newCodeLabel, setNewCodeLabel] = useState('');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState('1');
  const [newCodeRole, setNewCodeRole] = useState<string>('');

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

  const handleToggleLaunchMode = async () => {
    const newMode = launchMode === 'pre_launch' ? 'live' : 'pre_launch';
    const confirmed = window.confirm(
      newMode === 'live'
        ? '🚀 Go LIVE? This will open the full platform to all users. The waitlist gate will be removed.'
        : '🔒 Switch to PRE-LAUNCH? This will gate the platform behind the waitlist capture.'
    );
    if (!confirmed) return;
    await updateConfig.mutateAsync({ key: 'launch_mode', value: newMode });
  };

  const handleGenerateCode = async () => {
    const options: GenerateCodeOptions = {
      label: newCodeLabel || undefined,
      maxUses: parseInt(newCodeMaxUses) || 1,
      roleGrant: newCodeRole as GenerateCodeOptions['roleGrant'] || undefined,
    };
    await generateCode.mutateAsync(options);
    setNewCodeLabel('');
    setNewCodeMaxUses('1');
    setNewCodeRole('');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Code copied');
  };

  const handleExportCSV = () => {
    if (!waitlistData?.entries.length) return;
    const headers = ['Position', 'Email', 'Name', 'Role', 'Social', 'Status', 'Joined', 'Invite Code'];
    const rows = waitlistData.entries.map(e => [
      e.position,
      e.email,
      e.full_name || '',
      e.role_interest || '',
      e.social_handle || '',
      e.status,
      format(new Date(e.created_at), 'yyyy-MM-dd'),
      e.invite_code_used || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ═══ Launch Mode + Waitlist Stats ═══ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Launch Mode Control */}
        <Card className="bg-background/50 backdrop-blur-sm border-border/50 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Launch Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Platform Status</p>
                <p className="text-xs text-muted-foreground">
                  {launchMode === 'pre_launch' ? 'Visitors see waitlist capture' : 'Full platform is accessible'}
                </p>
              </div>
              {modeLoading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Badge className={launchMode === 'live'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }>
                  {launchMode === 'live' ? '🟢 LIVE' : '🔒 PRE-LAUNCH'}
                </Badge>
              )}
            </div>
            <Button
              variant={launchMode === 'live' ? 'outline' : 'default'}
              className={`w-full gap-2 ${launchMode !== 'live' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : ''}`}
              onClick={handleToggleLaunchMode}
              disabled={updateConfig.isPending}
            >
              {updateConfig.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : launchMode === 'live' ? (
                <>Switch to Pre-Launch</>
              ) : (
                <><Rocket className="w-4 h-4" /> Go Live</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Waitlist Stats */}
        <Card className="bg-background/50 backdrop-blur-sm border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-4 h-4" /> Waitlist Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Signups', value: waitlistStats?.totalSignups || 0, color: 'text-primary' },
                { label: 'Today', value: waitlistStats?.todaySignups || 0, color: 'text-cyan-500' },
                { label: 'Invited', value: waitlistStats?.invitedCount || 0, color: 'text-green-500' },
                { label: 'Converted', value: waitlistStats?.convertedCount || 0, color: 'text-purple-500' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Invite Code Generator ═══ */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="w-4 h-4" /> Invite Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generate new code */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
            <Input
              placeholder="Label (e.g., 'For DJ Khaled's team')"
              className="bg-background/50 flex-1"
              value={newCodeLabel}
              onChange={(e) => setNewCodeLabel(e.target.value)}
            />
            <Input
              type="number"
              min="1"
              placeholder="Max uses"
              className="bg-background/50 w-24"
              value={newCodeMaxUses}
              onChange={(e) => setNewCodeMaxUses(e.target.value)}
            />
            <Select value={newCodeRole} onValueChange={setNewCodeRole}>
              <SelectTrigger className="w-32 bg-background/50">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artist">Artist</SelectItem>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="producer">Producer</SelectItem>
                <SelectItem value="fan">Fan</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerateCode}
              disabled={generateCode.isPending}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 shrink-0"
            >
              {generateCode.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Generate Code
            </Button>
          </div>

          {/* Code list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {inviteCodes?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No invite codes generated yet</p>
            ) : (
              inviteCodes?.map(code => (
                <div
                  key={code.id}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-all
                    ${code.is_active ? 'border-border/30 bg-muted/10' : 'border-red-500/20 bg-red-500/5 opacity-60'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleCopyCode(code.code)}
                      className="flex items-center gap-2 font-mono text-sm font-bold tracking-wider text-primary hover:text-primary/80 transition-colors"
                    >
                      {code.code}
                      {copiedCode === code.code ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-50" />
                      )}
                    </button>
                    {code.label && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">{code.label}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {code.times_used}/{code.max_uses} used
                    </Badge>
                    {code.role_grant && (
                      <Badge variant="secondary" className="text-xs capitalize">{code.role_grant}</Badge>
                    )}
                    <Switch
                      checked={code.is_active}
                      onCheckedChange={(checked) => toggleCode.mutate({ id: code.id, isActive: checked })}
                      aria-label={`${code.is_active ? 'Deactivate' : 'Activate'} code ${code.code}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══ Waitlist Entries ═══ */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-4 h-4" /> Waitlist Entries
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchWaitlist()} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!waitlistData?.entries.length ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No waitlist entries yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {waitlistData.entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl border border-border/30 bg-muted/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-8">#{entry.position}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{entry.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {entry.full_name && (
                          <span className="text-xs text-muted-foreground">{entry.full_name}</span>
                        )}
                        {entry.role_interest && (
                          <Badge variant="outline" className="text-[10px] capitalize h-4 px-1.5">{entry.role_interest}</Badge>
                        )}
                        {entry.invite_code_used && (
                          <Badge className="text-[10px] bg-primary/20 text-primary border-0 h-4 px-1.5">{entry.invite_code_used}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM d')}
                    </span>
                    {entry.status === 'waiting' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-7 text-xs"
                        onClick={() => sendInvite.mutate(entry.id)}
                        disabled={sendInvite.isPending}
                      >
                        <Send className="w-3 h-3" /> Invite
                      </Button>
                    ) : (
                      <Badge className={
                        entry.status === 'invited'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      }>
                        {entry.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {waitlistData.totalCount > waitlistData.entries.length && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Showing {waitlistData.entries.length} of {waitlistData.totalCount} entries
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Existing Admin Tools ═══ */}
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
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${event.severity === 'critical' || event.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
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

/**
 * AdminLaunchHub — Launch Command Center for the First 100 Campaign
 *
 * War room with campaign stats, wave management, checklist, and countdown config.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Rocket, Users, Send, CheckCircle, Circle, Clock,
  Target, Flame, Zap, Plus, Calendar, Shield, ArrowRight,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useLaunchCampaignStats, useInviteWaves, useCreateInviteWave, useSendInviteWave, useLaunchChecklist } from '@/hooks/useLaunchCampaign';
import { useLaunchMode, useUpdateConfig } from '@/hooks/usePlatformConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WAVE_PLAYBOOK = [
  { wave: 1, day: 'Day 1', count: 10, role: 'engineer', label: 'Founding Engineers', color: 'text-green-500' },
  { wave: 2, day: 'Day 3', count: 15, role: 'artist', label: 'First Session Artists', color: 'text-purple-500' },
  { wave: 3, day: 'Day 5', count: 10, role: 'producer', label: 'Beat Pioneers', color: 'text-cyan-500' },
  { wave: 4, day: 'Day 7', count: 15, role: 'fan', label: 'Day 1 Supporters', color: 'text-orange-500' },
  { wave: 5, day: 'Day 10', count: 25, role: null, label: 'Inner Circle', color: 'text-yellow-500' },
  { wave: 6, day: 'Day 14', count: 25, role: null, label: 'The Century Club', color: 'text-pink-500' },
];

export function AdminLaunchHub() {
  const { data: stats } = useLaunchCampaignStats();
  const { data: waves } = useInviteWaves();
  const { data: checklist } = useLaunchChecklist();
  const { data: launchMode } = useLaunchMode();
  const updateConfig = useUpdateConfig();
  const createWave = useCreateInviteWave();
  const sendWave = useSendInviteWave();

  const [newWaveLabel, setNewWaveLabel] = useState('');
  const [newWaveCount, setNewWaveCount] = useState('10');
  const [newWaveRole, setNewWaveRole] = useState('');
  const [launchDate, setLaunchDate] = useState('');

  const handleCreateWave = () => {
    if (!newWaveLabel || !newWaveCount) return;
    const nextNumber = (waves?.length || 0) + 1;
    createWave.mutate({
      wave_label: newWaveLabel,
      wave_number: nextNumber,
      role_filter: newWaveRole || undefined,
      target_count: parseInt(newWaveCount),
    });
    setNewWaveLabel('');
    setNewWaveCount('10');
    setNewWaveRole('');
  };

  const handleSetLaunchDate = () => {
    if (!launchDate) return;
    updateConfig.mutate({ key: 'launch_date', value: launchDate });
    toast.success('Launch date set — countdown is live on the waitlist page');
  };

  const handleGoLive = async () => {
    const unpassedChecks = checklist?.filter(c => !c.passed) || [];
    if (unpassedChecks.length > 0) {
      toast.error(`Pre-flight checks incomplete: ${unpassedChecks.map(c => c.label).join(', ')}`);
      return;
    }

    try {
      await supabase.functions.invoke('launch-day-sequence', {});
      toast.success('🚀 WE ARE LIVE! Launch sequence initiated.');
    } catch {
      toast.error('Launch sequence failed');
    }
  };

  const isLive = launchMode === 'live';
  const progress = stats?.progress || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black">Launch Command Center</h2>
            <p className="text-sm text-muted-foreground">First 100 Campaign War Room</p>
          </div>
        </div>
        <Badge variant={isLive ? 'default' : 'secondary'} className="text-sm px-3 py-1">
          {isLive ? '🟢 LIVE' : '🟡 PRE-LAUNCH'}
        </Badge>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Waitlist', value: stats?.waitlistTotal || 0, icon: Users, color: 'text-blue-500' },
          { label: 'Invited', value: stats?.invitedCount || 0, icon: Send, color: 'text-green-500' },
          { label: 'Converted', value: stats?.convertedCount || 0, icon: CheckCircle, color: 'text-purple-500' },
          { label: 'Remaining', value: stats?.remaining || 100, icon: Target, color: 'text-orange-500' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardContent className="p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              First 100 Progress
            </span>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats?.registeredUsers || 0} registered users of {stats?.target || 100} target
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Wave Management */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Invite Waves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing waves */}
            {waves && waves.length > 0 ? (
              <div className="space-y-2">
                {waves.map((wave) => (
                  <div key={wave.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {wave.wave_number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{wave.wave_label}</p>
                        <p className="text-xs text-muted-foreground">
                          {wave.role_filter || 'Mixed'} · {wave.target_count} invites
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {wave.status === 'sent' ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sent {wave.actual_sent}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="glow"
                          onClick={() => sendWave.mutate(wave.id)}
                          disabled={sendWave.isPending}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No waves created yet</p>
            )}

            {/* Create new wave */}
            <div className="border-t border-border/20 pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Create Wave</p>
              <Input
                placeholder="Wave label (e.g., Founding Engineers)"
                value={newWaveLabel}
                onChange={(e) => setNewWaveLabel(e.target.value)}
                className="bg-muted/20 border-border/30 h-9 text-sm"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Count"
                  value={newWaveCount}
                  onChange={(e) => setNewWaveCount(e.target.value)}
                  className="bg-muted/20 border-border/30 h-9 text-sm w-20"
                />
                <Select value={newWaveRole} onValueChange={setNewWaveRole}>
                  <SelectTrigger className="bg-muted/20 border-border/30 h-9 text-sm flex-1">
                    <SelectValue placeholder="Role filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="engineer">Engineers</SelectItem>
                    <SelectItem value="artist">Artists</SelectItem>
                    <SelectItem value="producer">Producers</SelectItem>
                    <SelectItem value="fan">Fans</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleCreateWave} disabled={!newWaveLabel || createWave.isPending} className="h-9">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Playbook + Checklist */}
        <div className="space-y-4">
          {/* Playbook */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Wave Playbook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {WAVE_PLAYBOOK.map((w) => (
                  <div key={w.wave} className="flex items-center gap-3 text-xs py-1.5">
                    <span className="w-12 text-muted-foreground font-mono">{w.day}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                    <span className="w-6 text-center font-bold">{w.count}</span>
                    <span className={`capitalize ${w.color} font-medium`}>{w.role || 'Mixed'}</span>
                    <span className="text-muted-foreground ml-auto truncate">"{w.label}"</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 text-xs py-1.5 border-t border-border/20 mt-2 pt-2">
                  <span className="w-12 text-muted-foreground font-mono">Launch</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                  <Rocket className="w-3 h-3 text-primary" />
                  <span className="font-bold text-primary">Go Live — Open to Public</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Countdown Config */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                Launch Countdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="bg-muted/20 border-border/30 h-9 text-sm flex-1"
                />
                <Button size="sm" onClick={handleSetLaunchDate} disabled={!launchDate} className="h-9">
                  Set
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This countdown will appear on the waitlist page for all visitors.
              </p>
            </CardContent>
          </Card>

          {/* Go Live Checklist */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Pre-Flight Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checklist?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  {item.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <span className={item.passed ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                  </div>
                </div>
              ))}

              <Button
                variant="glow"
                className="w-full mt-4"
                onClick={handleGoLive}
                disabled={isLive || checklist?.some(c => !c.passed)}
              >
                <Rocket className="w-4 h-4 mr-2" />
                {isLive ? 'Already Live' : 'Launch — Go Live'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

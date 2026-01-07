import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, Download, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, differenceInMinutes, startOfWeek, endOfWeek } from 'date-fns';

interface TimeEntry {
  id: string;
  project_id: string | null;
  session_id: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  activity_type: string;
  is_billable: boolean;
  hourly_rate: number | null;
  notes: string | null;
}

interface Project {
  id: string;
  title: string;
}

export const TimeTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [activityType, setActivityType] = useState('mixing');
  const [isBillable, setIsBillable] = useState(true);

  const { data: projects = [] } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user?.id,
  });

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['time-entries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      const { data, error } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: false });
      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!user?.id,
  });

  const { data: activeEntry } = useQuery({
    queryKey: ['active-time-entry', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('user_id', user.id)
        .is('end_time', null)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as TimeEntry | null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (activeEntry) {
      setIsTracking(true);
      setActiveEntryId(activeEntry.id);
      setSelectedProject(activeEntry.project_id || '');
      setActivityType(activeEntry.activity_type);
      setIsBillable(activeEntry.is_billable);
    }
  }, [activeEntry]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && activeEntry) {
      const updateElapsed = () => {
        const start = new Date(activeEntry.start_time);
        setElapsedTime(differenceInMinutes(new Date(), start));
      };
      updateElapsed();
      interval = setInterval(updateElapsed, 60000);
    }
    return () => clearInterval(interval);
  }, [isTracking, activeEntry]);

  const startTimer = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('time_tracking')
        .insert({
          user_id: user.id,
          project_id: selectedProject || null,
          start_time: new Date().toISOString(),
          activity_type: activityType,
          is_billable: isBillable,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setIsTracking(true);
      setActiveEntryId(data.id);
      setElapsedTime(0);
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] });
      toast.success('Timer started');
    },
    onError: () => toast.error('Failed to start timer'),
  });

  const stopTimer = useMutation({
    mutationFn: async () => {
      if (!activeEntryId) throw new Error('No active timer');
      const endTime = new Date();
      const startTime = activeEntry ? new Date(activeEntry.start_time) : endTime;
      const duration = differenceInMinutes(endTime, startTime);
      
      const { error } = await supabase
        .from('time_tracking')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: duration,
        })
        .eq('id', activeEntryId);
      if (error) throw error;
    },
    onSuccess: () => {
      setIsTracking(false);
      setActiveEntryId(null);
      setElapsedTime(0);
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] });
      toast.success('Timer stopped');
    },
    onError: () => toast.error('Failed to stop timer'),
  });

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  const weeklyTotal = timeEntries.reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0);
  const billableTotal = timeEntries
    .filter(e => e.is_billable)
    .reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0);

  const exportTimesheet = () => {
    const csv = [
      ['Date', 'Project', 'Activity', 'Duration', 'Billable'].join(','),
      ...timeEntries.map(entry => [
        format(new Date(entry.start_time), 'yyyy-MM-dd'),
        projects.find(p => p.id === entry.project_id)?.title || 'No Project',
        entry.activity_type,
        entry.duration_minutes || 0,
        entry.is_billable ? 'Yes' : 'No',
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Timesheet exported');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
        <Button variant="outline" size="sm" onClick={exportTimesheet}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-mono font-bold">
              {formatDuration(elapsedTime)}
            </div>
            <Button
              size="lg"
              variant={isTracking ? 'destructive' : 'default'}
              onClick={() => isTracking ? stopTimer.mutate() : startTimer.mutate()}
              disabled={startTimer.isPending || stopTimer.isPending}
            >
              {isTracking ? (
                <><Square className="h-4 w-4 mr-2" /> Stop</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Start</>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject} disabled={isTracking}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Project</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Activity</Label>
              <Select value={activityType} onValueChange={setActivityType} disabled={isTracking}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixing">Mixing</SelectItem>
                  <SelectItem value="mastering">Mastering</SelectItem>
                  <SelectItem value="revisions">Revisions</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={isBillable} onCheckedChange={setIsBillable} disabled={isTracking} />
            <Label>Billable</Label>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{formatDuration(weeklyTotal)}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{formatDuration(billableTotal)}</div>
            <div className="text-sm text-muted-foreground">Billable</div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Week
          </h4>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading...</div>
          ) : timeEntries.length === 0 ? (
            <div className="text-muted-foreground text-sm">No time entries this week</div>
          ) : (
            <div className="space-y-2">
              {timeEntries.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{entry.activity_type}</Badge>
                    <span className="text-sm">
                      {projects.find(p => p.id === entry.project_id)?.title || 'No Project'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.is_billable && <Badge variant="secondary">$</Badge>}
                    <span className="font-mono text-sm">
                      {formatDuration(entry.duration_minutes || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

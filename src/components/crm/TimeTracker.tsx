import { useState, useEffect } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TimeTrackerProps {
  projectId: string;
}

export const TimeTracker = ({ projectId }: TimeTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    fetchTimeEntries();
  }, [projectId]);

  const fetchTimeEntries = async () => {
    const { data, error } = await supabase
      .from('time_tracking_entries')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      return;
    }

    setEntries(data || []);
    const total = data?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0;
    setTotalTime(total);
  };

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(new Date());
  };

  const stopTracking = async () => {
    if (!startTime) return;

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('time_tracking_entries')
      .insert({
        project_id: projectId,
        user_id: user.id,
        description: description || 'Work session',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        is_billable: true
      });

    if (error) {
      toast.error('Failed to save time entry');
      return;
    }

    toast.success(`Tracked ${durationMinutes} minutes`);
    setIsTracking(false);
    setStartTime(null);
    setDescription('');
    fetchTimeEntries();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Tracking
        </h3>
        <div className="text-sm text-muted-foreground">
          Total: {formatDuration(totalTime)}
        </div>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isTracking}
        />

        <div className="flex items-center gap-2">
          {!isTracking ? (
            <Button onClick={startTracking} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          ) : (
            <>
              <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center font-mono">
                {startTime && formatDistanceToNow(startTime, { addSuffix: false })}
              </div>
              <Button onClick={stopTracking} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        <h4 className="text-sm font-medium text-muted-foreground">Recent Entries</h4>
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
            <span className="truncate flex-1">{entry.description}</span>
            <span className="font-mono text-muted-foreground ml-2">
              {formatDuration(entry.duration_minutes)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

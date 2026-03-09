import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Music, Users, Share2 } from 'lucide-react';
import { format } from 'date-fns';

interface PremiereSchedulerProps {
  projectId: string;
  audioUrl: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PremiereScheduler({ projectId, audioUrl, open, onClose, onSuccess }: PremiereSchedulerProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
  });

  const handleSchedule = async () => {
    if (!formData.date || !formData.time) {
      toast({
        title: 'Date and time required',
        description: 'Please select when your premiere should go live',
        variant: 'destructive',
      });
      return;
    }

    const scheduledAt = new Date(`${formData.date}T${formData.time}`);
    if (scheduledAt <= new Date()) {
      toast({
        title: 'Invalid date',
        description: 'Premiere must be scheduled for a future date',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('premieres')
        .insert({
          project_id: projectId,
          artist_id: user.id,
          title: formData.title || 'Untitled Premiere',
          description: formData.description || null,
          premiere_date: scheduledAt.toISOString(),
          audio_url: audioUrl,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: 'Premiere scheduled! 🎉',
        description: `Your track goes live on ${format(scheduledAt, 'MMMM d, yyyy')} at ${format(scheduledAt, 'h:mm a')}`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error scheduling premiere:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule premiere',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduledDate = formData.date && formData.time
    ? new Date(`${formData.date}T${formData.time}`)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a Premiere</DialogTitle>
          <DialogDescription>
            Build hype and let your fans know when your track drops
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium">Premiere Title</label>
            <Input
              placeholder="e.g., 'Midnight Drop' or 'Summer Anthem'"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea
              placeholder="Tell fans what to expect..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          {/* Preview Card */}
          {scheduledDate && (
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">Preview</span>
              </div>
              <h4 className="font-bold text-lg">
                {formData.title || 'Untitled Premiere'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {formData.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(scheduledDate, 'MMMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(scheduledDate, 'h:mm a')}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  Followers notified
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Share2 className="w-3 h-3" />
                  Share link ready
                </Badge>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Premiere'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PremiereSchedulerProps {
  projectId: string;
  audioUrl: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PremiereScheduler({ 
  projectId, 
  audioUrl, 
  open, 
  onClose, 
  onSuccess 
}: PremiereSchedulerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [premiereDate, setPremiereDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    bpm: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !premiereDate) return;

    try {
      setSubmitting(true);

      const { data: project } = await supabase
        .from('projects')
        .select('engineer_id')
        .eq('id', projectId)
        .single();

      const { error } = await supabase
        .from('premieres')
        .insert({
          project_id: projectId,
          artist_id: user.id,
          engineer_id: project?.engineer_id,
          title: formData.title,
          description: formData.description,
          genre: formData.genre,
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          audio_url: audioUrl,
          premiere_date: premiereDate.toISOString(),
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: "Premiere scheduled!",
        description: `Your track will premiere on ${format(premiereDate, 'PPP')}`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error scheduling premiere",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Track Premiere</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Track Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter track title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell fans about this track..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="e.g. Hip-Hop, R&B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                value={formData.bpm}
                onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
                placeholder="e.g. 120"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Premiere Date & Time *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !premiereDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {premiereDate ? format(premiereDate, "PPP 'at' p") : "Pick a date and time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={premiereDate}
                  onSelect={setPremiereDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Choose when your track will go live for fan voting
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.title || !premiereDate}
              className="bg-gradient-to-r from-accent to-accent-blue"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule Premiere
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

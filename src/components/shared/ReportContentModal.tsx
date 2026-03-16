import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_REASONS = [
  'Inappropriate or offensive content',
  'Copyright infringement',
  'Spam or misleading',
  'Low quality or broken file',
  'Other',
] as const;

interface ReportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'audio' | 'beat';
  contentId: string;
  contentName: string;
}

export const ReportContentModal = ({
  open,
  onOpenChange,
  contentType,
  contentId,
  contentName,
}: ReportContentModalProps) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason || !user) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from('content_reports').insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason: selectedReason,
        details: details || null,
      });

      if (error) throw error;

      toast.success('Report submitted — our team will review it');
      onOpenChange(false);
      setSelectedReason('');
      setDetails('');
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-orange-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Report &ldquo;{contentName}&rdquo; for review by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reason</Label>
            <div className="grid gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    selectedReason === reason
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Additional Details (optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any extra context..."
              className="bg-background/50 resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedReason || submitting} className="gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

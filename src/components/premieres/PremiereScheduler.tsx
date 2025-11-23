import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PremiereSchedulerProps {
  projectId: string;
  audioUrl: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PremiereScheduler({ open, onClose }: PremiereSchedulerProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Premiere Scheduler requires database configuration.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}

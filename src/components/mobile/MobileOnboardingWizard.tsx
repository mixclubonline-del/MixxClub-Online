import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MobileOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileOnboardingWizard = ({ open, onOpenChange }: MobileOnboardingWizardProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Onboarding wizard requires database schema updates.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

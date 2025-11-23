import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AddOnServicesProps {
  projectId?: string;
  onPurchaseComplete?: () => void;
}

export function AddOnServices({ projectId, onPurchaseComplete }: AddOnServicesProps) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Add-On Services requires database configuration.
      </AlertDescription>
    </Alert>
  );
}

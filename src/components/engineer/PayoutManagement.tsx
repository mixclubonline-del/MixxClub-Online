import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PayoutManagementProps {
  engineerId: string;
  availableBalance: number;
}

export function PayoutManagement({ engineerId, availableBalance }: PayoutManagementProps) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Payout Management feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
}

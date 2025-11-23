import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ContractExpirationAlerts() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Contract Expiration Alerts feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
}

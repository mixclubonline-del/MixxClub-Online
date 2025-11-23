import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const MonthlyAwards = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Monthly Awards feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
};

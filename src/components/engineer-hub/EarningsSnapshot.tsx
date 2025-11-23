import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EarningsSnapshot() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Earnings Snapshot feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
}

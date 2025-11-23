import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function RecentDeliveries() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Recent Deliveries feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
}

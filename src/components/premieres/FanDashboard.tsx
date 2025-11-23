import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function FanDashboard() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Fan Dashboard requires database configuration.
      </AlertDescription>
    </Alert>
  );
}

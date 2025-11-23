import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function MobileMixxBot() {
  return (
    <div className="p-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          MixxBot requires additional database configuration.
        </AlertDescription>
      </Alert>
    </div>
  );
}

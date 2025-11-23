import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EngineerSpotlight() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Engineer Spotlight feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
}

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CommunityStats() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Community Stats requires database configuration.
      </AlertDescription>
    </Alert>
  );
}

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function EngineerLeaderboard() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Engineer Leaderboard feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
}

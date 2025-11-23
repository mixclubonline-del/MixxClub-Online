import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function TopEngineersLeaderboard() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Top Engineers Leaderboard feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
}

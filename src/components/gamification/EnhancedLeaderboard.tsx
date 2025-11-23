import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const EnhancedLeaderboard = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Enhanced Leaderboard feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
};

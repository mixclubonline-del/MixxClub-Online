import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface QuickAchievementsProps {
  userId: string;
}

export const QuickAchievements = ({ userId }: QuickAchievementsProps) => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Quick Achievements feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
};

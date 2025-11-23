import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EngineerReviewsProps {
  engineerId: string;
}

export const EngineerReviews = ({ engineerId }: EngineerReviewsProps) => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Engineer Reviews requires database configuration.
      </AlertDescription>
    </Alert>
  );
};

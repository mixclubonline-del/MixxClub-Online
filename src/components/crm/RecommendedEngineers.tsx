import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const RecommendedEngineers = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Engineers</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Browse engineers in the Job Pool section.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

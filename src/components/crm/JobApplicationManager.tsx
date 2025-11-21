import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const JobApplicationManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Application Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please use the Job Pool feature to manage applications.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

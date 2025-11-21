import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const ApplicationTemplates = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This feature is being rebuilt to work with the current database schema.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

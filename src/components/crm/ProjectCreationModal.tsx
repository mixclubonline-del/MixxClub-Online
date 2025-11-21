import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const ProjectCreationModal = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Creation</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Use the Intelligent Project Upload feature in the main dashboard to create projects.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const AudioFileUpload = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio File Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please use the project upload feature in the main dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
